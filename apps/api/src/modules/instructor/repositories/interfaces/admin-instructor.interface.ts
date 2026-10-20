import { InstructorApplicationEntity } from '@/modules/instructor/entities/instructor-profile.entity';
import { ReviewableOfferingStatus } from '@/modules/instructor/types/offering-status.type';
import { IPaginatedResult } from '@/shared/types';
import { InstructorApplicationStatus } from '../../enums/instructor.enum';
import { IAdminListRepository, TransactionClient } from '@/shared/prisma/base';

export const ADMIN_INSTRUCTOR_REPOSITORY = Symbol(
  'ADMIN_INSTRUCTOR_REPOSITORY',
);

export interface AdminApplicationListParams {
  page: number;
  limit: number;
  status?: InstructorApplicationStatus;
  search?: string;
}

export interface IAdminInstructorRepository extends IAdminListRepository<
  InstructorApplicationEntity,
  AdminApplicationListParams
> {
  findApplicationsForAdmin(
    input: AdminApplicationListParams,
    tx?: TransactionClient,
  ): Promise<IPaginatedResult<InstructorApplicationEntity>>;

  findManyForAdmin(
    params: AdminApplicationListParams,
    tx?: TransactionClient,
  ): Promise<IPaginatedResult<InstructorApplicationEntity>>;

  findApplicationForAdmin(
    applicationId: string,
    tx?: TransactionClient,
  ): Promise<InstructorApplicationEntity | null>;

  findApplicationById(
    applicationId: string,
    tx?: TransactionClient,
  ): Promise<InstructorApplicationEntity | null>;

  reviewOffering(
    applicationId: string,
    offeringId: string,
    adminUserId: string,
    decision: ReviewableOfferingStatus,
    reviewNote?: string,
    tx?: TransactionClient,
  ): Promise<InstructorApplicationEntity | null>;
}
