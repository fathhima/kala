import { IPaginatedResult } from '@/shared/types';
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { type IAdminInstructorService } from './interfaces/admin-instructor.service.interface';
import { type IStorageService, STORAGE_SERVICE, } from '@/shared/storage/repositories/interfaces/storage.interface';
import { ADMIN_INSTRUCTOR_REPOSITORY, type IAdminInstructorRepository, } from '../repositories/interfaces/admin-instructor.interface';
import { AdminInstructorListParams } from '../types/admin-instructor-list-params.type';
import { InstructorApplicationEntity } from '../entities/instructor-profile.entity';
import { ReviewableOfferingStatus } from '../types/offering-status.type';
import { type IUserIdentityService, USER_IDENTITY_SERVICE } from '@/modules/user/services/interfaces/user-identity.service.interface';
import { OfferingStatus } from '../enums/instructor.enum';
import { UserRole } from '@/shared/enums/role.enum';

@Injectable()
export class AdminInstructorService implements IAdminInstructorService {
    constructor(
        @Inject(ADMIN_INSTRUCTOR_REPOSITORY)
        private readonly _adminInstructorRepository: IAdminInstructorRepository,
        @Inject(STORAGE_SERVICE)
        private readonly _storageService: IStorageService,
        @Inject(USER_IDENTITY_SERVICE)
        private readonly _userService: IUserIdentityService
    ) { }

    async getApplicationsForAdmin(query: AdminInstructorListParams,): Promise<IPaginatedResult<InstructorApplicationEntity>> {
        return this._adminInstructorRepository.findApplicationsForAdmin({
            page: query.page,
            limit: query.limit,
            status: query.status,
            search: query.search,
        });
    }

    async getApplicationForAdmin(applicationId: string,): Promise<InstructorApplicationEntity> {
        const application = await this._adminInstructorRepository.findApplicationForAdmin(applicationId,);

        if (!application) {
            throw new NotFoundException('Instructor application not found');
        }

        return application;
    }

    async reviewOffering(applicationId: string, offeringId: string, adminUserId: string, decision: ReviewableOfferingStatus, reviewNote?: string,): Promise<InstructorApplicationEntity> {
        if ((decision === 'REJECTED' || decision === 'CHANGES_REQUESTED') && !reviewNote?.trim()) {
            throw new BadRequestException('A review reason is required when rejecting or requesting changes',);
        }

        const result = await this._adminInstructorRepository.reviewOffering(applicationId, offeringId, adminUserId, decision, reviewNote?.trim(),);

        if (decision === OfferingStatus.APPROVED && result?.profile?.user?.id) {
            await this._userService.assignRole(result.profile.user.id, UserRole.INSTRUCTOR);
        }

        if (!result) {
            throw new ConflictException('This offering is not pending in this instructor application',);
        }

        return result;
    }

    async getOfferingMediaViewUrl(applicationId: string, offeringId: string, mediaId: string,) {
        const application = await this._adminInstructorRepository.findApplicationForAdmin(applicationId,);

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
