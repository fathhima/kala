import { InstructorApplicationStatus, MediaType, } from '@prisma/client';
import { PaginatedResult } from '@/shared/types';
import { InstructorApplicationEntity, InstructorOfferingEntity, InstructorProfileEntity, OfferingMediaEntity, } from '../../entities/instructor-profile.entity';
import { ReviewableOfferingStatus } from '../../types/offering-status.type';

export const INSTRUCTOR_REPOSITORY = Symbol('INSTRUCTOR_REPOSITORY');

export interface InstructorRepository {
    findWorkspaceByUserId(userId: string): Promise<InstructorProfileEntity | null>;

    upsertProfile(userId: string, input: { bio?: string; location?: string },): Promise<InstructorProfileEntity>;

    isSelectableSubcategory(subcategoryId: string): Promise<boolean>;

    createOffering(profileId: string, input: {
        subcategoryId: string;
        title?: string;
        description?: string;
        hourlyRate: number;
        currency?: string;
        experienceYears?: number;
    },
    ): Promise<InstructorOfferingEntity>;

    updateOffering(offeringId: string, input: {
        subcategoryId?: string;
        title?: string;
        description?: string;
        hourlyRate?: number;
        currency?: string;
        experienceYears?: number;
    },
    ): Promise<InstructorOfferingEntity>;

    deleteOffering(offeringId: string): Promise<void>;

    findOfferingById(offeringId: string): Promise<InstructorOfferingEntity | null>;

    countMedia(offeringId: string, type: MediaType): Promise<number>;

    createMedia(input: {
        offeringId: string;
        type: MediaType;
        storageKey: string;
        mimeType: string;
        sizeBytes: number;
        sortOrder: number;
    }): Promise<OfferingMediaEntity>;

    findMediaById(mediaId: string): Promise<OfferingMediaEntity | null>;

    deleteMedia(mediaId: string): Promise<void>;

    cancelPendingApplication(profileId: string, applicationId: string,): Promise<boolean>;

    submitApplication(profileId: string, offeringIds: string[],): Promise<InstructorApplicationEntity>;
}