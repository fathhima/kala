import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from "@nestjs/common";
import { USER_REPOSITORY, type IUserRepository, } from "@/modules/user/repositories/interfaces/user.interface";
import { REFRESH_SESSION_REPOSITORY, type IRefreshSessionRepository, } from "@/modules/auth/repositories/interfaces/refresh-session.interface";
import { UserQueryDto, UserStatusFilter, } from "@/modules/user/dto/request/user-query.dto";
import { UpdateUserStatusDto } from "@/modules/user/dto/request/update-user-status.request.dto";
import { UserEntity } from "@/modules/user/entities/user.entity";
import { UserRole } from "@/shared/enums/role.enum";
import { IPaginatedResult } from "@/shared/types";
import { ADMIN_USER_REPOSITORY, type IAdminUserRepository } from "../../user/repositories/interfaces/admin-user.interface";
import { IAdminUserService } from "./interfaces/admin-user.service.interface";

@Injectable()
export class AdminUserService implements IAdminUserService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly _userRepository: IUserRepository,

        @Inject(ADMIN_USER_REPOSITORY)
        private readonly _adminUserRepository: IAdminUserRepository,

        @Inject(REFRESH_SESSION_REPOSITORY)
        private readonly _refreshSessionRepository: IRefreshSessionRepository,
    ) { }

    async getUsers(query: UserQueryDto,): Promise<IPaginatedResult<UserEntity>> {
        const isActive =
            query.status === UserStatusFilter.ACTIVE
                ? true
                : query.status === UserStatusFilter.BLOCKED
                    ? false
                    : undefined;

        return this._adminUserRepository.findManyForAdmin({
            page: query.page ?? 1,
            limit: query.limit ?? 10,
            search: query.search,
            role: query.role,
            isActive,
        });
    }

    async getUserById(id: string): Promise<UserEntity> {
        const user = await this._userRepository.findById(id);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }

    async updateUserStatus(targetUserId: string, dto: UpdateUserStatusDto, adminUserId: string,): Promise<UserEntity> {
        const targetUser = await this._userRepository.findById(targetUserId);

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

        const updatedUser = targetUser.isActive === dto.isActive ? targetUser : await this._adminUserRepository.updateStatus(targetUserId, dto.isActive,);

        if (!updatedUser.isActive) {
            await this._refreshSessionRepository.revokeAllForUser(updatedUser.id,);
        }

        return updatedUser;
    }
}