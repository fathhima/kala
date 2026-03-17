import { UsersApi } from "@/api"
import { apiClient } from "@/api/axios"
import { apiConfig } from "@/api/client"

export const userApi = new UsersApi(apiConfig,undefined,apiClient)

export const UserService = {

}