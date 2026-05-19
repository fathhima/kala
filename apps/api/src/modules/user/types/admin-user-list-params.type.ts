import { Role } from "@prisma/client";

export type AdminUserListParams = {
    page: number;
    limit: number;
    search?: string;
    role?: Role;
    isActive?: boolean;
};