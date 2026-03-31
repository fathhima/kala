import { UsersApi, AuthenticationApi } from "@/api"
import { apiClient } from "@/api/axios"
import { apiConfig } from "@/api/client"
import { handleRequest } from "@/utils/handleRequest"

export const userApi = new UsersApi(apiConfig, undefined, apiClient)
export const authApi = new AuthenticationApi(apiConfig, undefined, apiClient)

export const UserService = {
	updateProfile: (id: string, body: { name?: string; imageUrl?: string }) =>
		handleRequest(() => userApi.userControllerUpdate(id, body)),
	changePassword: (password: string, newPassword: string) =>
		handleRequest(() => authApi.authControllerUpdatePassword({ password, newPassword })),
}