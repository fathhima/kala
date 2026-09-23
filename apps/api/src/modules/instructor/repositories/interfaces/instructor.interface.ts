import { InstructorApplicationEntity, InstructorOfferingEntity, InstructorProfileEntity, OfferingMediaEntity, } from '../../entities/instructor-profile.entity';
import { MediaType } from '../../enums/instructor.enum';
import { CreateOfferingInput, CreateOfferingMediaInput, PublicInstructorQueryInput, UpdateInstructorProfileInput, UpdateOfferingInput } from '../../types/instructor.type';
import { PublicInstructorProfile } from '../../types/public-instructor.type';

export const INSTRUCTOR_REPOSITORY = Symbol('INSTRUCTOR_REPOSITORY');

export interface IInstructorRepository {
    findPublicInstructors(input: PublicInstructorQueryInput): Promise<{ profiles: PublicInstructorProfile[]; total: number }>;

    findPublicInstructor(profileId: string): Promise<PublicInstructorProfile | null>;

    findWorkspaceByUserId(userId: string): Promise<InstructorProfileEntity | null>;

    upsertProfile(userId: string, input: UpdateInstructorProfileInput): Promise<InstructorProfileEntity>;

    createOffering(profileId: string, input: CreateOfferingInput): Promise<InstructorOfferingEntity>;

    updateOffering(offeringId: string, input: UpdateOfferingInput): Promise<InstructorOfferingEntity>;

    deleteOffering(offeringId: string): Promise<void>;

    findOfferingById(offeringId: string): Promise<InstructorOfferingEntity | null>;

    countMedia(offeringId: string, type: MediaType): Promise<number>;

    createMedia(input: CreateOfferingMediaInput): Promise<OfferingMediaEntity>;

    findMediaById(mediaId: string): Promise<OfferingMediaEntity | null>;

    deleteMedia(mediaId: string): Promise<void>;

    cancelPendingApplication(profileId: string, applicationId: string,): Promise<boolean>;

    submitApplication(profileId: string, offeringIds: string[],): Promise<InstructorApplicationEntity>;
}