import { AdminUserManagementApi, AdminUserResponseDto, Configuration, UpdateUserStatusDto, type PaginatedAdminUsersDataDto, type Role, } from '@/api'
import { apiClient } from '@/lib/axios'
import { AdminUsersQuery } from './types/admin-users.query.type'

const config = new Configuration({ basePath: import.meta.env.VITE_API_URL, })

const adminUsersApi = new AdminUserManagementApi(config, undefined, apiClient,)
export const getAdminUsers = async (query: AdminUsersQuery): Promise<PaginatedAdminUsersDataDto> => {
    const response = await adminUsersApi.adminUserControllerGetAdminUsers(
        query.page,
        query.limit,
        query.search,
        query.role,
        query.status,
    )

    return response.data.data
}

export const getAdminUserById = async (id: string,): Promise<AdminUserResponseDto> => {
    const response = await adminUsersApi.adminUserControllerGetAdminUserById(id)
    return response.data
}

export const updateAdminUserStatus = async (params: { id: string; isActive: boolean }) => {
    const payload: UpdateUserStatusDto = {
        isActive: params.isActive,
    }

    const response = await adminUsersApi.adminUserControllerUpdateAdminUserStatus(params.id, payload,)

    return response.data.data
}