import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { MediaType, } from '@prisma/client';
import { randomUUID } from 'crypto';
import { StorageService } from '@/shared/storage/storage.service';
import { UpdateInstructorProfileDto } from '../dto/request/update-instructor-profile.dto';
import { CreateOfferingDto } from '../dto/request/create-offering.dto';
import { UpdateOfferingDto } from '../dto/request/update-offering.dto';
import { OFFERING_MEDIA_MIME_TYPES, RequestOfferingMediaUploadDto, } from '../dto/request/request-offering-media-upload.dto';
import { ConfirmOfferingMediaUploadDto } from '../dto/request/confirm-offering-media-upload.dto';
import { InstructorApplicationEntity, InstructorOfferingEntity, InstructorProfileEntity, OfferingMediaEntity, } from '../entities/instructor-profile.entity';
import { isEditableOfferingStatus } from '../types/offering-status.type';
import { IInstructorService } from './interfaces/instructor.service.interface';
import { PublicInstructorQueryDto } from '../dto/request/public-instructor-query.dto';
import { PaginationMetaDto } from '@/shared/dto/response/pagination-meta.dto';
import { type IInstructorRepository, INSTRUCTOR_REPOSITORY } from '../repositories/interfaces/instructor.interface';
import { PublicInstructorProfile } from '../types/public-instructor.type';
import { PublicInstructorDto, PublicInstructorListDataDto } from '../dto/response/public-catelog-response.dto';

@Injectable()
export class InstructorService implements IInstructorService {
    constructor(
        @Inject(INSTRUCTOR_REPOSITORY)
        private readonly _instructorRepository: IInstructorRepository,
        private readonly _storageService: StorageService,
    ) { }

    async getPublicInstructors(query: PublicInstructorQueryDto,): Promise<PublicInstructorListDataDto> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;

        const result = await this._instructorRepository.findPublicInstructors({
            page,
            limit,
            search: query.search,
            subcategoryId: query.subcategoryId,
        });

        return {
            items: await Promise.all(result.profiles.map((profile) => this._toPublicInstructor(profile)),),
            meta: PaginationMetaDto.create(page, limit, result.total),
        };
    }

    async getPublicInstructor(profileId: string): Promise<PublicInstructorDto> {
        const profile = await this._instructorRepository.findPublicInstructor(profileId);

        if (!profile) {
            throw new NotFoundException('Instructor not found');
        }

        return this._toPublicInstructor(profile);
    }

    private async _toPublicInstructor(profile: PublicInstructorProfile,): Promise<PublicInstructorDto> {
        return {
            id: profile.id,
            name: profile.name,
            imageUrl: profile.imageUrl,
            bio: profile.bio,
            location: profile.location,
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

    async saveProfile(userId: string, dto: UpdateInstructorProfileDto,): Promise<InstructorProfileEntity> {
        await this._assertNoPendingApplication(userId);

        return this._instructorRepository.upsertProfile(userId, {
            bio: dto.bio?.trim(),
            location: dto.location?.trim(),
            portfolioUrl: dto.portfolioUrl?.trim(),
        });
    }

    async addOffering(userId: string, dto: CreateOfferingDto,): Promise<InstructorOfferingEntity> {
        await this._assertNoPendingApplication(userId);

        const profile = await this._getOrCreateDraftProfile(userId);
        await this._assertSubcategoryIsSelectable(dto.subcategoryId);

        return this._instructorRepository.createOffering(profile.id, dto);
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

    async updateOffering(userId: string, offeringId: string, dto: UpdateOfferingDto,): Promise<InstructorOfferingEntity> {
        const offering = await this._getOwnedEditableOffering(userId, offeringId);

        if (dto.subcategoryId) {
            await this._assertSubcategoryIsSelectable(dto.subcategoryId);
        }

        return this._instructorRepository.updateOffering(offering.id, dto);
    }

    async removeOffering(userId: string, offeringId: string): Promise<void> {
        const offering = await this._getOwnedEditableOffering(userId, offeringId);

        for (const media of offering.media) {
            await this._storageService.deleteObject(media.storageKey).catch(() => undefined);
        }

        await this._instructorRepository.deleteOffering(offering.id);
    }

    async createMediaUploadUrl(userId: string, offeringId: string, dto: RequestOfferingMediaUploadDto,) {
        await this._getOwnedPortfolioOffering(userId, offeringId);

        this._assertMediaTypeMatchesMimeType(dto.type, dto.mimeType);

        const currentCount = await this._instructorRepository.countMedia(offeringId, dto.type,);

        const maximum = dto.type === MediaType.IMAGE ? 10 : 3;

        if (currentCount >= maximum) {
            throw new BadRequestException(`An offering can have at most ${maximum} ${dto.type.toLowerCase()} files`,);
        }

        const extension = this._extensionForMimeType(dto.mimeType);
        const storageKey = `instructor-offerings/${offeringId}/${dto.type.toLowerCase()}/${randomUUID()}.${extension}`;

        return this._storageService.createUploadUrl({
            key: storageKey,
            contentType: dto.mimeType,
            expiresInSeconds: 300,
        });
    }

    async confirmMediaUpload(userId: string, offeringId: string, dto: ConfirmOfferingMediaUploadDto,): Promise<OfferingMediaEntity> {
        await this._getOwnedPortfolioOffering(userId, offeringId)

        const expectedPrefix = `instructor-offerings/${offeringId}/${dto.type.toLowerCase()}/`;

        if (!dto.storageKey.startsWith(expectedPrefix)) {
            throw new BadRequestException('Invalid offering media storage key');
        }

        const object = await this._storageService.getObjectMetadata(dto.storageKey);

        if (!object) {
            throw new BadRequestException('Uploaded media was not found');
        }

        if (!object.contentType) {
            throw new BadRequestException('Uploaded media has no content type');
        }

        this._assertMediaTypeMatchesMimeType(dto.type, object.contentType);

        const maxBytes =
            dto.type === MediaType.IMAGE ? 5 * 1024 * 1024 : 100 * 1024 * 1024;

        if (object.sizeBytes < 1 || object.sizeBytes > maxBytes) {
            throw new BadRequestException(dto.type === MediaType.IMAGE
                ? 'Image must be 5 MB or smaller'
                : 'Video must be 100 MB or smaller',
            );
        }

        const currentCount = await this._instructorRepository.countMedia(offeringId, dto.type,);

        const maximum = dto.type === MediaType.IMAGE ? 10 : 3;

        if (currentCount >= maximum) {
            throw new BadRequestException(`An offering can have at most ${maximum} ${dto.type.toLowerCase()} files`,);
        }

        return this._instructorRepository.createMedia({
            offeringId,
            type: dto.type,
            storageKey: dto.storageKey,
            mimeType: object.contentType,
            sizeBytes: object.sizeBytes,
            sortOrder: dto.sortOrder,
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
            throw new BadRequestException('Create your instructor profile first');
        }

        if (!workspace.portfolioUrl?.trim()) {
            throw new BadRequestException('Add your portfolio URL before submitting');
        }

        if (workspace.latestApplication?.status === 'PENDING') {
            throw new ConflictException('You already have an application under review');
        }

        const offerings = workspace.offerings.filter((offering) =>
            isEditableOfferingStatus(offering.status),
        );

        if (!offerings.length) {
            throw new BadRequestException('Add at least one draft, rejected, or changes-requested offering',);
        }

        for (const offering of offerings) {
            await this._assertSubcategoryIsSelectable(offering.subcategoryId);

            if (!offering.title?.trim() || !offering.description?.trim()) {
                throw new BadRequestException('Every submitted offering needs a title and description',);
            }

            if (!offering.media.some((media) => media.type === MediaType.IMAGE)) {
                throw new BadRequestException('Every submitted offering needs at least one portfolio image',);
            }
        }

        return this._instructorRepository.submitApplication(
            workspace.id,
            offerings.map((offering) => offering.id),
        );
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
        const valid = await this._instructorRepository.isSelectableSubcategory(subcategoryId);

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