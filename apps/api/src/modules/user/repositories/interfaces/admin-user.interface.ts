import { UserEntity } from "@/modules/user/entities/user.entity";
import { AdminUserListParams } from "@/modules/user/types/admin-user-list-params.type";
import { IPaginatedResult } from "@/shared/types";

export const ADMIN_USER_REPOSITORY = Symbol("ADMIN_USER_REPOSITORY");

export interface IAdminUserRepository {
    findManyForAdmin(params: AdminUserListParams,): Promise<IPaginatedResult<UserEntity>>;

    updateStatus(userId: string, isActive: boolean,): Promise<UserEntity>;
}