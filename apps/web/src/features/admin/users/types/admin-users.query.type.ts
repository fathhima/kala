import { AdminControllerGetAdminUsersStatusEnum, Role } from "@/api"

export type AdminUsersQuery = {
    page: number
    limit: number
    search?: string
    role?: Role
    status?: AdminControllerGetAdminUsersStatusEnum
}