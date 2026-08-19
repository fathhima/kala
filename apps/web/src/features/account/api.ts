import { AuthenticationApi, ChangePasswordDto, Configuration, UpdateUserProfileDto, UsersApi, } from '@/api'
import type { AuthUser } from '@/features/auth/store'
import { apiClient } from '@/lib/axios'
import type { ApiEnvelope } from '@/types/api-envelope'

const configuration = new Configuration({
    basePath: import.meta.env.VITE_API_URL,
})

const authApi = new AuthenticationApi(configuration, undefined, apiClient)
const usersApi = new UsersApi(configuration, undefined, apiClient)

export const updateMyProfile = async (payload: UpdateUserProfileDto,): Promise<AuthUser> => {
    const response = await usersApi.userControllerUpdateMe(payload)

    // Swagger currently generates this endpoint as `object`.
    return (response.data as ApiEnvelope<AuthUser>).data
}

export const changeMyPassword = async (payload: ChangePasswordDto) => {
    await authApi.authControllerChangePassword(payload)
}