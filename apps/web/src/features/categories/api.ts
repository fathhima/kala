import { Configuration, UsersApi, type CategoryDto } from '@/api'
import { apiClient } from '@/lib/axios'

const configuration = new Configuration({
    basePath: import.meta.env.VITE_API_URL,
})

const usersApi = new UsersApi(configuration, undefined, apiClient)

export const getSelectableCategories = async (): Promise<CategoryDto[]> => {
    const response = await usersApi.userControllerFindSelectable()

    return response.data.data
}