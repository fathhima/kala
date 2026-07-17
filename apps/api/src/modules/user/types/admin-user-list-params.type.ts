import { UserRole } from "@/shared/enums/role.enum";

export type AdminUserListParams = {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    isActive?: boolean;
};