import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from "@nestjs/common";

import { USER_REPOSITORY, type UserRepository, } from "@/modules/user/repositories/interfaces/user.repository";

import { REFRESH_SESSION_REPOSITORY, type RefreshSessionRepository, } from "@/modules/auth/repositories/interfaces/refresh-session.repository";

import { UserQueryDto, UserStatusFilter, } from "@/modules/user/dto/request/user-query.dto";

import { UpdateUserStatusDto } from "@/modules/user/dto/request/update-user-status.request.dto";
import { UserEntity } from "@/modules/user/entities/user.entity";
import { UserRole } from "@/shared/enums/role.enum";
import { PaginatedResult } from "@/shared/types";
import { ADMIN_REPOSITORY, type AdminRepository } from "./repositories/interfaces/admin.repository";

@Injectable()
export class AdminService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,

        @Inject(ADMIN_REPOSITORY)
        private readonly adminRepository: AdminRepository,

        @Inject(REFRESH_SESSION_REPOSITORY)
        private readonly refreshSessionRepository: RefreshSessionRepository,
    ) { }

    async getUsers(query: UserQueryDto,): Promise<PaginatedResult<UserEntity>> {
        const isActive =
            query.status === UserStatusFilter.ACTIVE
                ? true
                : query.status === UserStatusFilter.BLOCKED
                    ? false
                    : undefined;

        return this.adminRepository.findManyForAdmin({
            page: query.page ?? 1,
            limit: query.limit ?? 10,
            search: query.search,
            role: query.role,
            isActive,
        });
    }

    async getUserById(id: string): Promise<UserEntity> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }

    async updateUserStatus(targetUserId: string, dto: UpdateUserStatusDto, adminUserId: string,): Promise<UserEntity> {
        const targetUser = await this.userRepository.findById(targetUserId);

        if (!targetUser) {
            throw new NotFoundException("User not found");
        }

        if (!dto.isActive) {
            if (targetUser.id === adminUserId) {
                throw new BadRequestException("You cannot block your own account",);
            }

            if (targetUser.roles.includes(UserRole.ADMIN)) {
                throw new ConflictException("Admin accounts cannot be blocked",);
            }
        }

        const updatedUser = targetUser.isActive === dto.isActive ? targetUser : await this.adminRepository.updateStatus(targetUserId, dto.isActive,);

        if (!updatedUser.isActive) {
            await this.refreshSessionRepository.revokeAllForUser(updatedUser.id,);
        }

        return updatedUser;
    }
}