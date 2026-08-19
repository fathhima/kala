import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { MediaType, } from '@prisma/client';
import { randomUUID } from 'crypto';
import { StorageService } from '@/shared/storage/storage.service';
import { UpdateInstructorProfileDto } from './dto/request/update-instructor-profile.dto';
import { CreateOfferingDto } from './dto/request/create-offering.dto';
import { UpdateOfferingDto } from './dto/request/update-offering.dto';
import { OFFERING_MEDIA_MIME_TYPES, RequestOfferingMediaUploadDto, } from './dto/request/request-offering-media-upload.dto';
import { ConfirmOfferingMediaUploadDto } from './dto/request/confirm-offering-media-upload.dto';
import { InstructorApplicationEntity, InstructorOfferingEntity, InstructorProfileEntity, OfferingMediaEntity, } from './entities/instructor-profile.entity';
import { INSTRUCTOR_REPOSITORY, type InstructorRepository } from './repositories/interfaces/instructor.repository';
import { isEditableOfferingStatus } from './types/offering-status.type';

@Injectable()
export class InstructorService {
    constructor(
        @Inject(INSTRUCTOR_REPOSITORY)
        private readonly instructorRepository: InstructorRepository,
        private readonly storageService: StorageService,
    ) { }

    async getWorkspace(userId: string): Promise<InstructorProfileEntity | null> {
        return this.instructorRepository.findWorkspaceByUserId(userId);
    }

    async saveProfile(userId: string, dto: UpdateInstructorProfileDto,): Promise<InstructorProfileEntity> {
        await this.assertNoPendingApplication(userId);

        return this.instructorRepository.upsertProfile(userId, {
            bio: dto.bio?.trim(),
            location: dto.location?.trim(),
        });
    }

    async addOffering(userId: string, dto: CreateOfferingDto,): Promise<InstructorOfferingEntity> {
        await this.assertNoPendingApplication(userId);

        const profile = await this.getOrCreateDraftProfile(userId);
        await this.assertSubcategoryIsSelectable(dto.subcategoryId);

        return this.instructorRepository.createOffering(profile.id, dto);
    }

    async cancelApplication(userId: string, applicationId: string,): Promise<void> {
        const workspace = await this.instructorRepository.findWorkspaceByUserId(userId);

        if (!workspace) {
            throw new NotFoundException('Instructor application not found');
        }

        if (workspace.latestApplication?.id !== applicationId || workspace.latestApplication.status !== 'PENDING') {
            throw new ConflictException('Only your current pending application can be cancelled',);
        }

        const cancelled = await this.instructorRepository.cancelPendingApplication(workspace.id, applicationId,);

        if (!cancelled) {
            throw new ConflictException('Application could not be cancelled');
        }
    }

    async updateOffering(userId: string, offeringId: string, dto: UpdateOfferingDto,): Promise<InstructorOfferingEntity> {
        const offering = await this.getOwnedEditableOffering(userId, offeringId);

        if (dto.subcategoryId) {
            await this.assertSubcategoryIsSelectable(dto.subcategoryId);
        }

        return this.instructorRepository.updateOffering(offering.id, dto);
    }

    async removeOffering(userId: string, offeringId: string): Promise<void> {
        const offering = await this.getOwnedEditableOffering(userId, offeringId);

        for (const media of offering.media) {
            await this.storageService.deleteObject(media.storageKey).catch(() => undefined);
        }

        await this.instructorRepository.deleteOffering(offering.id);
    }

    async createMediaUploadUrl(userId: string, offeringId: string, dto: RequestOfferingMediaUploadDto,) {
        await this.getOwnedPortfolioOffering(userId, offeringId);

        this.assertMediaTypeMatchesMimeType(dto.type, dto.mimeType);

        const currentCount = await this.instructorRepository.countMedia(offeringId, dto.type,);

        const maximum = dto.type === MediaType.IMAGE ? 10 : 3;

        if (currentCount >= maximum) {
            throw new BadRequestException(`An offering can have at most ${maximum} ${dto.type.toLowerCase()} files`,);
        }

        const extension = this.extensionForMimeType(dto.mimeType);
        const storageKey = `instructor-offerings/${offeringId}/${dto.type.toLowerCase()}/${randomUUID()}.${extension}`;

        return this.storageService.createUploadUrl({
            key: storageKey,
            contentType: dto.mimeType,
            expiresInSeconds: 300,
        });
    }

    async confirmMediaUpload(userId: string, offeringId: string, dto: ConfirmOfferingMediaUploadDto,): Promise<OfferingMediaEntity> {
        await this.getOwnedPortfolioOffering(userId, offeringId)

        const expectedPrefix = `instructor-offerings/${offeringId}/${dto.type.toLowerCase()}/`;

        if (!dto.storageKey.startsWith(expectedPrefix)) {
            throw new BadRequestException('Invalid offering media storage key');
        }

        const object = await this.storageService.getObjectMetadata(dto.storageKey);

        if (!object) {
            throw new BadRequestException('Uploaded media was not found');
        }

        if (!object.contentType) {
            throw new BadRequestException('Uploaded media has no content type');
        }

        this.assertMediaTypeMatchesMimeType(dto.type, object.contentType);

        const maxBytes =
            dto.type === MediaType.IMAGE ? 5 * 1024 * 1024 : 100 * 1024 * 1024;

        if (object.sizeBytes < 1 || object.sizeBytes > maxBytes) {
            throw new BadRequestException(dto.type === MediaType.IMAGE
                ? 'Image must be 5 MB or smaller'
                : 'Video must be 100 MB or smaller',
            );
        }

        const currentCount = await this.instructorRepository.countMedia(offeringId, dto.type,);

        const maximum = dto.type === MediaType.IMAGE ? 10 : 3;

        if (currentCount >= maximum) {
            throw new BadRequestException(`An offering can have at most ${maximum} ${dto.type.toLowerCase()} files`,);
        }

        return this.instructorRepository.createMedia({
            offeringId,
            type: dto.type,
            storageKey: dto.storageKey,
            mimeType: object.contentType,
            sizeBytes: object.sizeBytes,
            sortOrder: dto.sortOrder,
        });
    }

    async removeMedia(userId: string, offeringId: string, mediaId: string,): Promise<void> {
        const offering = await this.getOwnedPortfolioOffering(userId, offeringId);
        const media = offering.media.find((item) => item.id === mediaId);

        if (!media) {
            throw new NotFoundException('Offering media not found');
        }

        await this.instructorRepository.deleteMedia(media.id);
        await this.storageService.deleteObject(media.storageKey).catch(() => undefined);
    }

    async getMediaViewUrl(userId: string, offeringId: string, mediaId: string,) {
        const offering = await this.getOwnedOffering(userId, offeringId);
        const media = offering.media.find((item) => item.id === mediaId);

        if (!media) {
            throw new NotFoundException('Offering media not found');
        }

        return this.storageService.createDownloadUrl({
            key: media.storageKey,
            expiresInSeconds: 900,
        });
    }

    async submitApplication(userId: string): Promise<InstructorApplicationEntity> {
        const workspace = await this.instructorRepository.findWorkspaceByUserId(userId);

        if (!workspace) {
            throw new BadRequestException('Create your instructor profile first');
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
            await this.assertSubcategoryIsSelectable(offering.subcategoryId);

            if (!offering.title?.trim() || !offering.description?.trim()) {
                throw new BadRequestException('Every submitted offering needs a title and description',);
            }

            if (!offering.media.some((media) => media.type === MediaType.IMAGE)) {
                throw new BadRequestException('Every submitted offering needs at least one portfolio image',);
            }
        }

        return this.instructorRepository.submitApplication(
            workspace.id,
            offerings.map((offering) => offering.id),
        );
    }

    private async assertNoPendingApplication(userId: string): Promise<void> {
        const workspace = await this.instructorRepository.findWorkspaceByUserId(userId);

        if (workspace?.latestApplication?.status === 'PENDING') {
            throw new ConflictException('Your application is under review and cannot be changed',);
        }
    }

    private async getOrCreateDraftProfile(userId: string) {
        return (
            (await this.instructorRepository.findWorkspaceByUserId(userId)) ??
            this.instructorRepository.upsertProfile(userId, {})
        );
    }

    private async getOwnedOffering(userId: string, offeringId: string,): Promise<InstructorOfferingEntity> {
        const workspace = await this.instructorRepository.findWorkspaceByUserId(userId);
        const offering = workspace?.offerings.find((item) => item.id === offeringId);

        if (!offering) {
            throw new NotFoundException('Offering not found');
        }

        return offering;
    }

    private async getOwnedEditableOffering(userId: string, offeringId: string,): Promise<InstructorOfferingEntity> {
        await this.assertNoPendingApplication(userId);

        const offering = await this.getOwnedOffering(userId, offeringId);

        if (!isEditableOfferingStatus(offering.status)) {
            throw new ConflictException('Only draft, rejected, or changes-requested offerings can be changed',);
        }

        return offering;
    }

    private async getOwnedPortfolioOffering(userId: string, offeringId: string,): Promise<InstructorOfferingEntity> {
        await this.assertNoPendingApplication(userId)

        const offering = await this.getOwnedOffering(userId, offeringId)

        if (offering.status !== 'APPROVED' && !isEditableOfferingStatus(offering.status)) {
            throw new ConflictException('Portfolio media can only be changed for approved or editable offerings',)
        }

        return offering
    }

    private async assertSubcategoryIsSelectable(subcategoryId: string) {
        const valid = await this.instructorRepository.isSelectableSubcategory(subcategoryId);

        if (!valid) {
            throw new BadRequestException('Select an active subcategory within an active category',);
        }
    }

    private assertMediaTypeMatchesMimeType(type: MediaType, mimeType: string) {
        if (!OFFERING_MEDIA_MIME_TYPES.includes(mimeType as any)) {
            throw new BadRequestException('Unsupported media type');
        }

        const isImage = mimeType.startsWith('image/');
        const isVideo = mimeType.startsWith('video/');

        if ((type === MediaType.IMAGE && !isImage) || (type === MediaType.VIDEO && !isVideo)) {
            throw new BadRequestException('Media type does not match its MIME type');
        }
    }

    private extensionForMimeType(mimeType: string): string {
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