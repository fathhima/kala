import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InstructorApplicationEntity, InstructorOfferingEntity, InstructorProfileEntity, OfferingMediaEntity, } from '../entities/instructor-profile.entity';
import { isEditableOfferingStatus, isSubmittableOfferingStatus } from '../types/offering-status.type';
import { IInstructorService } from './interfaces/instructor.service.interface';
import { type IInstructorRepository, INSTRUCTOR_REPOSITORY } from '../repositories/interfaces/instructor.interface';
import { PublicInstructorProfile, PublicInstructorResponse } from '../types/public-instructor.type';
import { OFFERING_MEDIA_MIME_TYPES } from '../constants/media-mime-types';
import { InstructorApplicationStatus, MediaType } from '../enums/instructor.enum';
import { STORAGE_SERVICE, type IStorageService } from '@/shared/storage/repositories/interfaces/storage.interface';
import { ConfirmOfferingMediaUploadInput, CreateOfferingInput, PublicInstructorQueryInput, RequestOfferingMediaUploadInput, UpdateInstructorProfileInput, UpdateOfferingInput } from '../types/instructor.type';
import { IPaginatedResult } from '@/shared/types/paginated-result';
import { PresignedUpload } from '@/shared/storage/types/presigned-upload.type';
import { type ILoggerService, LOGGER_SERVICE } from '@/shared/logger/repositories/interfaces/logger.interface';
import { CATEGORY_SERVICE, type ICategoryService } from '@/modules/category/services/interfaces/category.service.interface';
import { type IInstructorQuery, INSTRUCTOR_QUERY } from '../repositories/interfaces/instructor-query.interface';

@Injectable()
export class InstructorService implements IInstructorService {
    constructor(
        @Inject(INSTRUCTOR_REPOSITORY)
        private readonly _instructorRepository: IInstructorRepository,
        @Inject(STORAGE_SERVICE)
        private readonly _storageService: IStorageService,
        @Inject(CATEGORY_SERVICE)
        private readonly _categoryService: ICategoryService,
        @Inject(INSTRUCTOR_QUERY)
        private readonly _instructorQuery: IInstructorQuery,
        @Inject(LOGGER_SERVICE)
        private readonly _loggerService: ILoggerService,
    ) { }

    async getPublicInstructors(query: PublicInstructorQueryInput): Promise<IPaginatedResult<PublicInstructorResponse>> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;

        const result = await this._instructorRepository.findPublicInstructors({
            page,
            limit,
            search: query.search,
            subcategoryId: query.subcategoryId,
        });

        return {
            items: await Promise.all(result.profiles.map((profile) => this._toPublicInstructor(profile))),
            total: result.total,
            page,
            limit,
        };
    }

    async getPublicInstructor(profileId: string): Promise<PublicInstructorResponse> {
        const profile = await this._instructorRepository.findPublicInstructor(profileId);

        if (!profile) {
            throw new NotFoundException('Instructor not found');
        }

        return this._toPublicInstructor(profile);
    }

    private async _toPublicInstructor(profile: PublicInstructorProfile,): Promise<PublicInstructorResponse> {
        return {
            id: profile.id,
            name: profile.name,
            imageUrl: profile.imageUrl,
            bio: profile.bio,
            location: profile.location,
            portfolioUrl: profile.portfolioUrl,
            offerings: await Promise.all(
                profile.offerings.map(async (offering) => ({
                    id: offering.id,
                    title: offering.title,
                    description: offering.description,
                    hourlyRate: offering.hourlyRate.toString(),
                    currency: offering.currency,
                    experienceYears: offering.experienceYears,
                    subcategory: {
                        id: offering.subcategory.id,
                        name: offering.subcategory.name,
                        slug: offering.subcategory.slug,
                        category: {
                            id: offering.subcategory.category.id,
                            name: offering.subcategory.category.name,
                            slug: offering.subcategory.category.slug,
                        },
                    },
                    media: await Promise.all(
                        offering.media.map(async (media) => {
                            const download = await this._storageService.createDownloadUrl({
                                key: media.storageKey,
                                expiresInSeconds: 900,
                            });

                            return {
                                id: media.id,
                                type: media.type,
                                viewUrl: download.viewUrl,
                            };
                        }),
                    ),
                })),
            ),
        };
    }

    async getWorkspace(userId: string): Promise<InstructorProfileEntity | null> {
        return this._instructorRepository.findWorkspaceByUserId(userId);
    }

    async saveProfile(userId: string, input: UpdateInstructorProfileInput): Promise<InstructorProfileEntity> {
        await this._assertNoPendingApplication(userId);

        return this._instructorRepository.upsertProfile(userId, {
            bio: input.bio?.trim(),
            location: input.location?.trim(),
            portfolioUrl: input.portfolioUrl?.trim(),
        });
    }

    async addOffering(userId: string, input: CreateOfferingInput): Promise<InstructorOfferingEntity> {
        await this._assertNoPendingApplication(userId);

        const profile = await this._getOrCreateDraftProfile(userId);
        await this._assertSubcategoryIsSelectable(input.subcategoryId);

        return this._instructorRepository.createOffering(profile.id, input);
    }

    async cancelApplication(userId: string, applicationId: string,): Promise<void> {
        const workspace = await this._instructorRepository.findWorkspaceByUserId(userId);

        if (!workspace) {
            throw new NotFoundException('Instructor application not found');
        }

        if (workspace.latestApplication?.id !== applicationId || workspace.latestApplication.status !== 'PENDING') {
            throw new ConflictException('Only your current pending application can be cancelled',);
        }

        const cancelled = await this._instructorRepository.cancelPendingApplication(workspace.id, applicationId,);

        if (!cancelled) {
            throw new ConflictException('Application could not be cancelled');
        }
    }

    async updateOffering(userId: string, offeringId: string, input: UpdateOfferingInput): Promise<InstructorOfferingEntity> {
        const offering = await this._getOwnedEditableOffering(userId, offeringId);

        if (input.subcategoryId) {
            await this._assertSubcategoryIsSelectable(input.subcategoryId);
        }

        return this._instructorRepository.updateOffering(offering.id, input);
    }

    async removeOffering(userId: string, offeringId: string): Promise<void> {
        const offering = await this._getOwnedEditableOffering(userId, offeringId);

        for (const media of offering.media) {
            await this._storageService.deleteObject(media.storageKey).catch((error) => {
                this._loggerService.error(
                    `Failed to delete stored object: ${media.storageKey}`,
                    error instanceof Error ? error.stack : undefined,
                    InstructorService.name,
                );
            });
        }

        await this._instructorRepository.deleteOffering(offering.id);
    }

    async createMediaUploadUrl(userId: string, offeringId: string, input: RequestOfferingMediaUploadInput): Promise<PresignedUpload> {
        await this._getOwnedPortfolioOffering(userId, offeringId);

        this._assertMediaTypeMatchesMimeType(input.type, input.mimeType);

        const currentCount = await this._instructorRepository.countMedia(offeringId, input.type,);

        const maximum = input.type === MediaType.IMAGE ? 10 : 3;

        if (currentCount >= maximum) {
            throw new BadRequestException(`An offering can have at most ${maximum} ${input.type.toLowerCase()} files`,);
        }

        const extension = this._extensionForMimeType(input.mimeType);
        const storageKey = `instructor-offerings/${offeringId}/${input.type.toLowerCase()}/${randomUUID()}.${extension}`;

        return this._storageService.createUploadUrl({
            key: storageKey,
            contentType: input.mimeType,
            expiresInSeconds: 300,
        });
    }

    async confirmMediaUpload(userId: string, offeringId: string, input: ConfirmOfferingMediaUploadInput): Promise<OfferingMediaEntity> {
        await this._getOwnedPortfolioOffering(userId, offeringId)

        const expectedPrefix = `instructor-offerings/${offeringId}/${input.type.toLowerCase()}/`;

        if (!input.storageKey.startsWith(expectedPrefix)) {
            throw new BadRequestException('Invalid offering media storage key');
        }

        const object = await this._storageService.getObjectMetadata(input.storageKey);

        if (!object) {
            throw new BadRequestException('Uploaded media was not found');
        }

        if (!object.contentType) {
            throw new BadRequestException('Uploaded media has no content type');
        }

        this._assertMediaTypeMatchesMimeType(input.type, object.contentType);

        const maxBytes =
            input.type === MediaType.IMAGE ? 5 * 1024 * 1024 : 100 * 1024 * 1024;

        if (object.sizeBytes < 1 || object.sizeBytes > maxBytes) {
            throw new BadRequestException(input.type === MediaType.IMAGE
                ? 'Image must be 5 MB or smaller'
                : 'Video must be 100 MB or smaller',
            );
        }

        const currentCount = await this._instructorRepository.countMedia(offeringId, input.type,);

        const maximum = input.type === MediaType.IMAGE ? 10 : 3;

        if (currentCount >= maximum) {
            throw new BadRequestException(`An offering can have at most ${maximum} ${input.type.toLowerCase()} files`,);
        }

        return this._instructorRepository.createMedia({
            offeringId,
            type: input.type,
            storageKey: input.storageKey,
            mimeType: object.contentType,
            sizeBytes: object.sizeBytes,
            sortOrder: input.sortOrder,
        });
    }

    async removeMedia(userId: string, offeringId: string, mediaId: string,): Promise<void> {
        const offering = await this._getOwnedPortfolioOffering(userId, offeringId);
        const media = offering.media.find((item) => item.id === mediaId);

        if (!media) {
            throw new NotFoundException('Offering media not found');
        }

        await this._instructorRepository.deleteMedia(media.id);
        await this._storageService.deleteObject(media.storageKey).catch(() => undefined);
    }

    async getMediaViewUrl(userId: string, offeringId: string, mediaId: string,) {
        const offering = await this._getOwnedOffering(userId, offeringId);
        const media = offering.media.find((item) => item.id === mediaId);

        if (!media) {
            throw new NotFoundException('Offering media not found');
        }

        return this._storageService.createDownloadUrl({
            key: media.storageKey,
            expiresInSeconds: 900,
        });
    }

    async submitApplication(userId: string): Promise<InstructorApplicationEntity> {
        const workspace = await this._instructorRepository.findWorkspaceByUserId(userId);

        if (!workspace) {
            throw new NotFoundException('Instructor profile not found');
        }

        const offeringIds = workspace.offerings
            .filter((offering) => isSubmittableOfferingStatus(offering.status))
            .map((offering) => offering.id);

        if (!offeringIds.length) {
            throw new BadRequestException('No offerings available to submit');
        }

        const openReview = workspace.latestApplication;
        if (openReview?.status === InstructorApplicationStatus.PENDING) {
            throw new ConflictException('An application is already pending review');
        }

        return this._instructorRepository.submitApplication(workspace.id, offeringIds);
    }

    async findApprovedProfileByUserId(userId: string) {
        return this._instructorQuery.findApprovedProfileIdByUserId(userId);
    }

    async findApprovedOfferingForProfile(profileId: string, offeringId: string) {
        return this._instructorQuery.findApprovedOfferingId(profileId, offeringId);
    }

    async getOfferingSnapshots(offeringIds: string[]) {
        return this._instructorQuery.getOfferingSnapshots(offeringIds);
    }

    private async _assertNoPendingApplication(userId: string): Promise<void> {
        const workspace = await this._instructorRepository.findWorkspaceByUserId(userId);

        if (workspace?.latestApplication?.status === 'PENDING') {
            throw new ConflictException('Your application is under review and cannot be changed',);
        }
    }

    private async _getOrCreateDraftProfile(userId: string) {
        return (
            (await this._instructorRepository.findWorkspaceByUserId(userId)) ??
            this._instructorRepository.upsertProfile(userId, {})
        );
    }

    private async _getOwnedOffering(userId: string, offeringId: string,): Promise<InstructorOfferingEntity> {
        const workspace = await this._instructorRepository.findWorkspaceByUserId(userId);
        const offering = workspace?.offerings.find((item) => item.id === offeringId);

        if (!offering) {
            throw new NotFoundException('Offering not found');
        }

        return offering;
    }

    private async _getOwnedEditableOffering(userId: string, offeringId: string,): Promise<InstructorOfferingEntity> {
        await this._assertNoPendingApplication(userId);

        const offering = await this._getOwnedOffering(userId, offeringId);

        if (!isEditableOfferingStatus(offering.status)) {
            throw new ConflictException('Only draft, rejected, or changes-requested offerings can be changed',);
        }

        return offering;
    }

    private async _getOwnedPortfolioOffering(userId: string, offeringId: string,): Promise<InstructorOfferingEntity> {
        await this._assertNoPendingApplication(userId)

        const offering = await this._getOwnedOffering(userId, offeringId)

        if (offering.status !== 'APPROVED' && !isEditableOfferingStatus(offering.status)) {
            throw new ConflictException('Portfolio media can only be changed for approved or editable offerings',)
        }

        return offering
    }

    private async _assertSubcategoryIsSelectable(subcategoryId: string) {
        const valid = await this._categoryService.isSelectableSubcategory(subcategoryId);

        if (!valid) {
            throw new BadRequestException('Select an active subcategory within an active category',);
        }
    }

    private _assertMediaTypeMatchesMimeType(type: MediaType, mimeType: string) {
        if (!OFFERING_MEDIA_MIME_TYPES.includes(mimeType as any)) {
            throw new BadRequestException('Unsupported media type');
        }

        const isImage = mimeType.startsWith('image/');
        const isVideo = mimeType.startsWith('video/');

        if ((type === MediaType.IMAGE && !isImage) || (type === MediaType.VIDEO && !isVideo)) {
            throw new BadRequestException('Media type does not match its MIME type');
        }
    }

    private _extensionForMimeType(mimeType: string): string {
        const extensions: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'video/mp4': 'mp4',
            'video/webm': 'webm',
        };

        const extension = extensions[mimeType];

        if (!extension) {
            throw new BadRequestException('Unsupported media type');
        }

        return extension;
    }
}