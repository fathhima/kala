import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from "@nestjs/common";
import { UserRole } from "@/shared/enums/role.enum";
import { ADMIN_USER_REPOSITORY, type IAdminUserRepository } from "../repositories/interfaces/admin-user.interface";
import { IAdminUserService } from "./interfaces/admin-user.service.interface";
import { type IUserRepository, USER_REPOSITORY } from "../repositories/interfaces/user.interface";
import { AdminUserListParams } from "../types/admin-user-list-params.type";
import { UserEntity } from "../entities/user.entity";
import { UpdateUserStatusInput } from "../types/update-user-status.type";
import { AdminUserResponseDto } from "../dto/response/admin-user-detail-response.dto";
import { AdminUserStatusResponseDto } from "../dto/response/admin-user-status-response.dto";
import { PaginatedAdminUsersResponseDto } from "../dto/response/admin-paginated-user-list.dto";

@Injectable()
export class AdminUserService implements IAdminUserService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly _userRepository: IUserRepository,

        @Inject(ADMIN_USER_REPOSITORY)
        private readonly _adminUserRepository: IAdminUserRepository,
    ) { }

    async getUsers(query: AdminUserListParams,): Promise<PaginatedAdminUsersResponseDto> {
        const result = await this._adminUserRepository.findManyForAdmin({
            page: query.page ?? 1,
            limit: query.limit ?? 10,
            search: query.search,
            role: query.role,
            isActive: query.isActive,
        });
        return PaginatedAdminUsersResponseDto.fromResult({ message: 'Users fetched successfully', result });
    }

    async getUserById(id: string): Promise<AdminUserResponseDto> {
        const user = await this._userRepository.findById(id);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return AdminUserResponseDto.fromResult({ message: 'User fetched successfully', user });
    }

    async updateUserStatus(targetUserId: string, input: UpdateUserStatusInput, adminUserId: string,): Promise<AdminUserStatusResponseDto> {
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

        const user = targetUser.isActive === input.isActive ? targetUser
            : await this._adminUserRepository.updateStatus(targetUserId, input.isActive);

        return AdminUserStatusResponseDto.fromResult({
            message: user.isActive ? 'User unblocked successfully' : 'User blocked successfully',
            user,
        });
    }
}