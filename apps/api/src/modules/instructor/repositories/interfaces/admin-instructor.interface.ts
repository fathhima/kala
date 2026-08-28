import type { InstructorApplicationStatus } from '@prisma/client';
import { InstructorApplicationEntity } from '@/modules/instructor/entities/instructor-profile.entity';
import { ReviewableOfferingStatus } from '@/modules/instructor/types/offering-status.type';
import { IPaginatedResult } from '@/shared/types';

export const ADMIN_INSTRUCTOR_REPOSITORY = Symbol('ADMIN_INSTRUCTOR_REPOSITORY');

export interface IAdminInstructorRepository {
    findApplicationsForAdmin(input: {
        page: number;
        limit: number;
        status?: InstructorApplicationStatus;
        search?: string;
    }): Promise<IPaginatedResult<InstructorApplicationEntity>>;

    findApplicationForAdmin(applicationId: string): Promise<InstructorApplicationEntity | null>;

    reviewOffering(applicationId: string, offeringId: string, adminUserId: string, decision: ReviewableOfferingStatus, reviewNote?: string,): Promise<InstructorApplicationEntity | null>;
}