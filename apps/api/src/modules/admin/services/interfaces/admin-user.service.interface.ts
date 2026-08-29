import { UserQueryDto } from "@/modules/user/dto/request/user-query.dto";
import { UpdateUserStatusDto } from "@/modules/user/dto/request/update-user-status.request.dto";
import { UserEntity } from "@/modules/user/entities/user.entity";
import { IPaginatedResult } from "@/shared/types";

export const ADMIN_USER_SERVICE = Symbol('ADMIN_USER_SERVICE');

export interface IAdminUserService {
    getUsers(query: UserQueryDto): Promise<IPaginatedResult<UserEntity>>;

    getUserById(id: string): Promise<UserEntity>;

    updateUserStatus(targetUserId: string, dto: UpdateUserStatusDto, adminUserId: string): Promise<UserEntity>;
}
