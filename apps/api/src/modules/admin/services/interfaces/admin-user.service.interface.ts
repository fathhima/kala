import { UserEntity } from "@/modules/user/entities/user.entity";
import { IPaginatedResult } from "@/shared/types";
import { AdminUserListParams } from "@/modules/user/types/admin-user-list-params.type";
import { UpdateUserStatusInput } from "@/modules/user/types/update-user-status.type";

export const ADMIN_USER_SERVICE = Symbol('ADMIN_USER_SERVICE');

export interface IAdminUserService {
    getUsers(query: AdminUserListParams): Promise<IPaginatedResult<UserEntity>>;

    getUserById(id: string): Promise<UserEntity>;

    updateUserStatus(targetUserId: string, input: UpdateUserStatusInput, adminUserId: string): Promise<UserEntity>;
}
