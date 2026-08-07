import {
    AdminApi,
    AdminControllerGetAdminUsersStatusEnum,
    AdminUserResponseDto,
    Configuration,
    UpdateUserStatusDto,
    type PaginatedAdminUsersDataDto,
    type Role,
} from '@/api'
import { apiClient } from '@/lib/axios'

const config = new Configuration({
    basePath: import.meta.env.VITE_API_URL,
})

const adminApi = new AdminApi(config, undefined, apiClient)

export type AdminUsersQuery = {
    page: number
    limit: number
    search?: string
    role?: Role
    status?: AdminControllerGetAdminUsersStatusEnum
}

export const getAdminUsers = async (query: AdminUsersQuery): Promise<PaginatedAdminUsersDataDto> => {
    const response = await adminApi.adminControllerGetAdminUsers(
        query.page,
        query.limit,
        query.search,
        query.role,
        query.status,
    )

    return response.data.data
}

export const getAdminUserById = async (
    id: string,
): Promise<AdminUserResponseDto> => {
    const response = await adminApi.adminControllerGetAdminUserById(id)
    return response.data
}

export const updateAdminUserStatus = async (params: { id: string; isActive: boolean }) => {
    const payload: UpdateUserStatusDto = {
        isActive: params.isActive,
    }

    const response = await adminApi.adminControllerUpdateAdminUserStatus(
        params.id,
        payload,
    )

    return response.data.data
}