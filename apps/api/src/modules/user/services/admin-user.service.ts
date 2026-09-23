import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from "@nestjs/common";
import { UserRole } from "@/shared/enums/role.enum";
import { IPaginatedResult } from "@/shared/types";
import { ADMIN_USER_REPOSITORY, type IAdminUserRepository } from "../repositories/interfaces/admin-user.interface";
import { IAdminUserService } from "./interfaces/admin-user.service.interface";
import { type IUserRepository, USER_REPOSITORY } from "../repositories/interfaces/user.interface";
import { AdminUserListParams } from "../types/admin-user-list-params.type";
import { UserEntity } from "../entities/user.entity";
import { UpdateUserStatusInput } from "../types/update-user-status.type";

@Injectable()
export class AdminUserService implements IAdminUserService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly _userRepository: IUserRepository,

        @Inject(ADMIN_USER_REPOSITORY)
        private readonly _adminUserRepository: IAdminUserRepository,
    ) { }

    async getUsers(query: AdminUserListParams,): Promise<IPaginatedResult<UserEntity>> {
        return this._adminUserRepository.findManyForAdmin({
            page: query.page ?? 1,
            limit: query.limit ?? 10,
            search: query.search,
            role: query.role,
            isActive: query.isActive,
        });
    }

    async getUserById(id: string): Promise<UserEntity> {
        const user = await this._userRepository.findById(id);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }

    async updateUserStatus(targetUserId: string, input: UpdateUserStatusInput, adminUserId: string,): Promise<UserEntity> {
        const targetUser = await this._userRepository.findById(targetUserId);

        if (!targetUser) {
            throw new NotFoundException("User not found");
        }

        if (!input.isActive) {
            if (targetUser.id === adminUserId) {
                throw new BadRequestException("You cannot block your own account",);
            }

            if (targetUser.roles.includes(UserRole.ADMIN)) {
                throw new ConflictException("Admin accounts cannot be blocked",);
            }
        }

        return targetUser.isActive === input.isActive ? targetUser
            : this._adminUserRepository.updateStatus(targetUserId, input.isActive);
    }
}