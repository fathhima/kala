import { PresignedDownload } from '@/shared/storage/types/presigned-download.type';
import { PresignedUpload } from '@/shared/storage/types/presigned-upload.type';
import { InstructorApplicationEntity, InstructorOfferingEntity, InstructorProfileEntity, OfferingMediaEntity, } from '../../entities/instructor-profile.entity';
import { UpdateInstructorProfileDto } from '../../dto/request/update-instructor-profile.dto';
import { CreateOfferingDto } from '../../dto/request/create-offering.dto';
import { UpdateOfferingDto } from '../../dto/request/update-offering.dto';
import { RequestOfferingMediaUploadDto } from '../../dto/request/request-offering-media-upload.dto';
import { ConfirmOfferingMediaUploadDto } from '../../dto/request/confirm-offering-media-upload.dto';
import { PublicInstructorQueryDto } from '../../dto/request/public-instructor-query.dto';
import { PublicInstructorDto, PublicInstructorListDataDto } from '../../dto/response/public-catelog-response.dto';

export const INSTRUCTOR_SERVICE = Symbol('INSTRUCTOR_SERVICE');

export interface IInstructorService {
    getPublicInstructors(query: PublicInstructorQueryDto): Promise<PublicInstructorListDataDto>;

    getPublicInstructor(profileId: string): Promise<PublicInstructorDto>;

    getWorkspace(userId: string): Promise<InstructorProfileEntity | null>;

    saveProfile(userId: string, dto: UpdateInstructorProfileDto): Promise<InstructorProfileEntity>;

    addOffering(userId: string, dto: CreateOfferingDto): Promise<InstructorOfferingEntity>;

    updateOffering(userId: string, offeringId: string, dto: UpdateOfferingDto): Promise<InstructorOfferingEntity>;

    removeOffering(userId: string, offeringId: string): Promise<void>;

    createMediaUploadUrl(userId: string, offeringId: string, dto: RequestOfferingMediaUploadDto): Promise<PresignedUpload>;

    confirmMediaUpload(userId: string, offeringId: string, dto: ConfirmOfferingMediaUploadDto): Promise<OfferingMediaEntity>;

    getMediaViewUrl(userId: string, offeringId: string, mediaId: string): Promise<PresignedDownload>;

    removeMedia(userId: string, offeringId: string, mediaId: string): Promise<void>;

    cancelApplication(userId: string, applicationId: string): Promise<void>;

    submitApplication(userId: string): Promise<InstructorApplicationEntity>;
}