import { AdminUserControllerGetAdminUsersStatusEnum, Role } from "@/api"

export type AdminUsersQuery = {
    page: number
    limit: number
    search?: string
    role?: Role
    status?: AdminUserControllerGetAdminUsersStatusEnum
}