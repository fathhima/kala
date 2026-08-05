import { UserEntity } from "@/modules/user/entities/user.entity";
import { AdminUserListParams } from "@/modules/user/types/admin-user-list-params.type";
import { PaginatedResult } from "@/shared/types";


export const ADMIN_REPOSITORY = Symbol("ADMIN_REPOSITORY");

export interface AdminRepository {
    findManyForAdmin(params: AdminUserListParams,): Promise<PaginatedResult<UserEntity>>;

    updateStatus(userId: string, isActive: boolean,): Promise<UserEntity>;
}