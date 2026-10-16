import { OfferingSnapshot } from '../../types/offering-snapshot.type';
import { MessageResponseDto } from '@/shared/dto/response/message-response.dto';
import {
    InstructorApplicationResponseDto,
    InstructorOfferingResponseDto,
    InstructorProfileResponseDto,
    OfferingMediaResponseDto,
    PresignedDownloadResponseDto,
    PresignedUploadResponseDto,
} from '../../dto/response/instructor-response.dto';
import {
    PublicInstructorListResponseDto,
    PublicInstructorResponseDto,
} from '../../dto/response/public-catelog-response.dto';
import { PublicInstructorQueryDto } from '../../dto/request/public-instructor-query.dto';
import { UpdateInstructorProfileDto } from '../../dto/request/update-instructor-profile.dto';
import { CreateOfferingDto } from '../../dto/request/create-offering.dto';
import { UpdateOfferingDto } from '../../dto/request/update-offering.dto';
import { RequestOfferingMediaUploadDto } from '../../dto/request/request-offering-media-upload.dto';
import { ConfirmOfferingMediaUploadDto } from '../../dto/request/confirm-offering-media-upload.dto';

export const INSTRUCTOR_SERVICE = Symbol('INSTRUCTOR_SERVICE');

export interface IInstructorService {
    getPublicInstructors(query: PublicInstructorQueryDto): Promise<PublicInstructorListResponseDto>;

    getPublicInstructor(profileId: string): Promise<PublicInstructorResponseDto>;

    getWorkspace(userId: string): Promise<InstructorProfileResponseDto>;

    saveProfile(userId: string, input: UpdateInstructorProfileDto): Promise<InstructorProfileResponseDto>;

    addOffering(userId: string, input: CreateOfferingDto): Promise<InstructorOfferingResponseDto>;

    updateOffering(userId: string, offeringId: string, input: UpdateOfferingDto): Promise<InstructorOfferingResponseDto>;

    removeOffering(userId: string, offeringId: string): Promise<MessageResponseDto>;

    createMediaUploadUrl(userId: string, offeringId: string, input: RequestOfferingMediaUploadDto): Promise<PresignedUploadResponseDto>;

    confirmMediaUpload(userId: string, offeringId: string, input: ConfirmOfferingMediaUploadDto): Promise<OfferingMediaResponseDto>;

    getMediaViewUrl(userId: string, offeringId: string, mediaId: string): Promise<PresignedDownloadResponseDto>;

    removeMedia(userId: string, offeringId: string, mediaId: string): Promise<MessageResponseDto>;

    cancelApplication(userId: string, applicationId: string): Promise<MessageResponseDto>;

    submitApplication(userId: string): Promise<InstructorApplicationResponseDto>;

    findApprovedProfileByUserId(userId: string): Promise<{ id: string } | null>;

    findApprovedOfferingForProfile(profileId: string, offeringId: string): Promise<{ id: string } | null>;
    
    getOfferingSnapshots(offeringIds: string[]): Promise<OfferingSnapshot[]>;
}