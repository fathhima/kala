import { InstructorApplicationQueryDto } from "@/modules/instructor/dto/request/instructor-application-query.dto";
import { InstructorApplicationEntity } from "@/modules/instructor/entities/instructor-profile.entity";
import { ReviewableOfferingStatus } from "@/modules/instructor/types/offering-status.type";
import { IPaginatedResult } from "@/shared/types";
import { PresignedDownload } from "@/shared/storage/types/presigned-download.type";

export const ADMIN_INSTRUCTOR_SERVICE = Symbol('ADMIN_INSTRUCTOR_SERVICE');

export interface IAdminInstructorService {
    getApplicationsForAdmin(query: InstructorApplicationQueryDto): Promise<IPaginatedResult<InstructorApplicationEntity>>;

    getApplicationForAdmin(applicationId: string): Promise<InstructorApplicationEntity>;

    reviewOffering(applicationId: string, offeringId: string, adminUserId: string, decision: ReviewableOfferingStatus, reviewNote?: string,): Promise<InstructorApplicationEntity>;

    getOfferingMediaViewUrl(applicationId: string, offeringId: string, mediaId: string): Promise<PresignedDownload>;
}
