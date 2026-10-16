import { ReviewableOfferingStatus } from "@/modules/instructor/types/offering-status.type";
import { AdminInstructorListParams } from "@/modules/instructor/types/admin-instructor-list-params.type";
import { InstructorApplicationResponseDto, PaginatedInstructorApplicationsResponseDto, PresignedDownloadResponseDto } from "@/modules/instructor/dto/response/instructor-response.dto";

export const ADMIN_INSTRUCTOR_SERVICE = Symbol('ADMIN_INSTRUCTOR_SERVICE');

export interface IAdminInstructorService {
    getApplicationsForAdmin(query: AdminInstructorListParams): Promise<PaginatedInstructorApplicationsResponseDto>;

    getApplicationForAdmin(applicationId: string): Promise<InstructorApplicationResponseDto>;

    reviewOffering(applicationId: string, offeringId: string, adminUserId: string, decision: ReviewableOfferingStatus, reviewNote?: string,): Promise<InstructorApplicationResponseDto>;

    getOfferingMediaViewUrl(applicationId: string, offeringId: string, mediaId: string): Promise<PresignedDownloadResponseDto>;
}
