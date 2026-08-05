import { UserEntity } from "@/modules/user/entities/user.entity";
import { AdminUserListParams } from "@/modules/user/types/admin-user-list-params.type";
import { PaginatedResult } from "@/shared/types";

export const ADMIN_USER_REPOSITORY = Symbol("ADMIN_USER_REPOSITORY");

export interface AdminUserRepository {
    findManyForAdmin(params: AdminUserListParams,): Promise<PaginatedResult<UserEntity>>;

    updateStatus(userId: string, isActive: boolean,): Promise<UserEntity>;
}