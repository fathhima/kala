import { InstructorApplicationQueryDto } from "@/modules/instructor/dto/request/instructor-application-query.dto";
import { InstructorApplicationEntity } from "@/modules/instructor/entities/instructor-profile.entity";
import { ADMIN_INSTRUCTOR_REPOSITORY, type AdminInstructorRepository } from "@/modules/instructor/repositories/interfaces/admin-instructor.repositoty";
import { ReviewableOfferingStatus } from "@/modules/instructor/types/offering-status.type";
import { StorageService } from "@/shared/storage/storage.service";
import { PaginatedResult } from "@/shared/types";
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class AdminInstructorService {

    constructor(@Inject(ADMIN_INSTRUCTOR_REPOSITORY)
    private readonly instructorReviewRepository: AdminInstructorRepository,
        private readonly storageService: StorageService
    ) { }

    async getApplicationsForAdmin(query: InstructorApplicationQueryDto,): Promise<PaginatedResult<InstructorApplicationEntity>> {
        return this.instructorReviewRepository.findApplicationsForAdmin({
            page: query.page,
            limit: query.limit,
            status: query.status,
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

    async getOfferingMediaViewUrl(applicationId: string, offeringId: string, mediaId: string,) {
        const application = await this.instructorReviewRepository.findApplicationForAdmin(applicationId);

        if (!application) {
            throw new NotFoundException('Instructor application not found');
        }

        const offering = application.offerings.find((item) => item.id === offeringId,);

        if (!offering) {
            throw new NotFoundException('Offering not found in this application');
        }

        const media = offering.media.find((item) => item.id === mediaId);

        if (!media) {
            throw new NotFoundException('Offering media not found');
        }

        return this.storageService.createDownloadUrl({
            key: media.storageKey,
            expiresInSeconds: 900,
        });
    }
}