import { InstructorApplicationQueryDto } from "@/modules/instructor/dto/request/instructor-application-query.dto";
import { InstructorApplicationEntity } from "@/modules/instructor/entities/instructor-profile.entity";
import { INSTRUCTOR_REVIEW_REPOSITORY, type InstructorReviewRepository } from "@/modules/instructor/repositories/interfaces/instructor-review.repositoty";
import { ReviewableOfferingStatus } from "@/modules/instructor/types/offering-status.type";
import { PaginatedResult } from "@/shared/types";
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class AdminInstructorService {

    constructor(@Inject(INSTRUCTOR_REVIEW_REPOSITORY)
    private readonly instructorReviewRepository: InstructorReviewRepository) { }

    async getApplicationsForAdmin(query: InstructorApplicationQueryDto,): Promise<PaginatedResult<InstructorApplicationEntity>> {
        return this.instructorReviewRepository.findApplicationsForAdmin({
            page: query.page,
            limit: query.limit,
            status: query.status ?? 'PENDING',
            search: query.search,
        });
    }

    async getApplicationForAdmin(applicationId: string,): Promise<InstructorApplicationEntity> {
        const application = await this.instructorReviewRepository.findApplicationForAdmin(applicationId);

        if (!application) {
            throw new NotFoundException('Instructor application not found');
        }

        return application;
    }

    async reviewOffering(
        applicationId: string,
        offeringId: string,
        adminUserId: string,
        decision: ReviewableOfferingStatus,
        reviewNote?: string,
    ): Promise<InstructorApplicationEntity> {
        if ((decision === 'REJECTED' || decision === 'CHANGES_REQUESTED') && !reviewNote?.trim()) {
            throw new BadRequestException('A review reason is required when rejecting or requesting changes',);
        }

        const result = await this.instructorReviewRepository.reviewOffering(
            applicationId,
            offeringId,
            adminUserId,
            decision,
            reviewNote?.trim(),
        );

        if (!result) {
            throw new ConflictException('This offering is not pending in this instructor application',);
        }

        return result;
    }
}