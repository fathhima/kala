import type { InstructorApplicationStatus } from '@prisma/client';
import { PaginatedResult } from '@/shared/types';
import { InstructorApplicationEntity } from '../../entities/instructor-profile.entity';
import type { ReviewableOfferingStatus } from '../../types/offering-status.type';

export const INSTRUCTOR_REVIEW_REPOSITORY = Symbol('INSTRUCTOR_REVIEW_REPOSITORY',);

export interface InstructorReviewRepository {
    findApplicationsForAdmin(input: {
        page: number;
        limit: number;
        status?: InstructorApplicationStatus;
        search?: string;
    }): Promise<PaginatedResult<InstructorApplicationEntity>>;

    findApplicationForAdmin(applicationId: string,): Promise<InstructorApplicationEntity | null>;

    reviewOffering(
        applicationId: string,
        offeringId: string,
        adminUserId: string,
        decision: ReviewableOfferingStatus,
        reviewNote?: string,
    ): Promise<InstructorApplicationEntity | null>;
}