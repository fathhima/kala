import {
    Configuration,
    UpdateUserStatusDto,
    UsersApi,
    type PaginatedAdminUsersDataDto,
    type Role,
    type UserControllerGetAdminUsersStatusEnum,
} from '@/api'
import { apiClient } from '@/lib/axios'

const config = new Configuration({
    basePath: import.meta.env.VITE_API_URL,
})

const usersApi = new UsersApi(config, undefined, apiClient)

export type AdminUsersQuery = {
    page: number
    limit: number
    search?: string
    role?: Role
    status?: UserControllerGetAdminUsersStatusEnum
}

export const getAdminUsers = async (query: AdminUsersQuery): Promise<PaginatedAdminUsersDataDto> => {
    const response = await usersApi.userControllerGetAdminUsers(
        query.page,
        query.limit,
        query.search,
        query.role,
        query.status,
    )

    return response.data.data
}

export const updateAdminUserStatus = async (params: { id: string; isActive: boolean }) => {
    const payload: UpdateUserStatusDto = {
        isActive: params.isActive,
    }

    const response = await usersApi.userControllerUpdateAdminUserStatus(
        params.id,
        payload,
    )

    return response.data.data
}