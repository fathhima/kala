import { PresignedDownload } from '@/shared/storage/types/presigned-download.type';
import { PresignedUpload } from '@/shared/storage/types/presigned-upload.type';
import { InstructorApplicationEntity, InstructorOfferingEntity, InstructorProfileEntity, OfferingMediaEntity, } from '../../entities/instructor-profile.entity';
import { PublicInstructorResponse } from '../../types/public-instructor.type';
import { IPaginatedResult } from '@/shared/types';
import { ConfirmOfferingMediaUploadInput, CreateOfferingInput, PublicInstructorQueryInput, RequestOfferingMediaUploadInput, UpdateInstructorProfileInput, UpdateOfferingInput } from '../../types/instructor.type';

export const INSTRUCTOR_SERVICE = Symbol('INSTRUCTOR_SERVICE');

export interface IInstructorService {
    getPublicInstructors(query: PublicInstructorQueryInput): Promise<IPaginatedResult<PublicInstructorResponse>>;

    getPublicInstructor(profileId: string): Promise<PublicInstructorResponse>;

    getWorkspace(userId: string): Promise<InstructorProfileEntity | null>;

    saveProfile(userId: string, input: UpdateInstructorProfileInput): Promise<InstructorProfileEntity>;

    addOffering(userId: string, input: CreateOfferingInput): Promise<InstructorOfferingEntity>;

    updateOffering(userId: string, offeringId: string, input: UpdateOfferingInput): Promise<InstructorOfferingEntity>;

    removeOffering(userId: string, offeringId: string): Promise<void>;

    createMediaUploadUrl(userId: string, offeringId: string, input: RequestOfferingMediaUploadInput): Promise<PresignedUpload>;

    confirmMediaUpload(userId: string, offeringId: string, input: ConfirmOfferingMediaUploadInput): Promise<OfferingMediaEntity>;

    getMediaViewUrl(userId: string, offeringId: string, mediaId: string): Promise<PresignedDownload>;

    removeMedia(userId: string, offeringId: string, mediaId: string): Promise<void>;

    cancelApplication(userId: string, applicationId: string): Promise<void>;

    submitApplication(userId: string): Promise<InstructorApplicationEntity>;
}