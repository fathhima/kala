import { InstructorApplicationEntity } from "@/modules/instructor/entities/instructor-profile.entity";
import { ReviewableOfferingStatus } from "@/modules/instructor/types/offering-status.type";
import { IPaginatedResult } from "@/shared/types";
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { type IAdminInstructorService } from "./interfaces/admin-instructor.service.interface";
import { ADMIN_INSTRUCTOR_REPOSITORY, type IAdminInstructorRepository } from "@/modules/instructor/repositories/interfaces/admin-instructor.interface";
import { type IStorageService, STORAGE_SERVICE } from "@/shared/storage/repositories/interfaces/storage.interface";
import { AdminInstructorListParams } from "@/modules/instructor/types/admin-instructor-list-params.type";


@Injectable()
export class AdminInstructorService implements IAdminInstructorService {
    constructor(
        @Inject(ADMIN_INSTRUCTOR_REPOSITORY)
        private readonly _instructorReviewRepository: IAdminInstructorRepository,
        @Inject(STORAGE_SERVICE)
        private readonly _storageService: IStorageService
    ) { }

    async getApplicationsForAdmin(query: AdminInstructorListParams,): Promise<IPaginatedResult<InstructorApplicationEntity>> {
        return this._instructorReviewRepository.findApplicationsForAdmin({
            page: query.page,
            limit: query.limit,
            status: query.status,
            search: query.search,
        });
    }

    async getApplicationForAdmin(applicationId: string,): Promise<InstructorApplicationEntity> {
        const application = await this._instructorReviewRepository.findApplicationForAdmin(applicationId);

        if (!application) {
            throw new NotFoundException('Instructor application not found');
        }

        return application;
    }

    async reviewOffering(applicationId: string, offeringId: string, adminUserId: string, decision: ReviewableOfferingStatus, reviewNote?: string,): Promise<InstructorApplicationEntity> {
        if ((decision === 'REJECTED' || decision === 'CHANGES_REQUESTED') && !reviewNote?.trim()) {
            throw new BadRequestException('A review reason is required when rejecting or requesting changes',);
        }

        const result = await this._instructorReviewRepository.reviewOffering(applicationId, offeringId, adminUserId, decision, reviewNote?.trim(),);

        if (!result) {
            throw new ConflictException('This offering is not pending in this instructor application',);
        }

        return result;
    }

    async getOfferingMediaViewUrl(applicationId: string, offeringId: string, mediaId: string,) {
        const application = await this._instructorReviewRepository.findApplicationForAdmin(applicationId)

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

        return this._storageService.createDownloadUrl({
            key: media.storageKey,
            expiresInSeconds: 900,
        });
    }
}