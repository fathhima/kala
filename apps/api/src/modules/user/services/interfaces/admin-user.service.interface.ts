import { AdminUserListParams } from "@/modules/user/types/admin-user-list-params.type";
import { UpdateUserStatusInput } from "@/modules/user/types/update-user-status.type";
import { AdminUserResponseDto } from "@/modules/user/dto/response/admin-user-detail-response.dto";
import { AdminUserStatusResponseDto } from "@/modules/user/dto/response/admin-user-status-response.dto";
import { PaginatedAdminUsersResponseDto } from "@/modules/user/dto/response/admin-paginated-user-list.dto";

export const ADMIN_USER_SERVICE = Symbol('ADMIN_USER_SERVICE');

export interface IAdminUserService {
    getUsers(query: AdminUserListParams): Promise<PaginatedAdminUsersResponseDto>;

    getUserById(id: string): Promise<AdminUserResponseDto>;

    updateUserStatus(targetUserId: string, input: UpdateUserStatusInput, adminUserId: string): Promise<AdminUserStatusResponseDto>;
}
