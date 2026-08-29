import { CategoriesApi, Configuration, type CategoryDto } from '@/api'
import { apiClient } from '@/lib/axios'

const categoriesApi = new CategoriesApi(new Configuration({ basePath: import.meta.env.VITE_API_URL }), undefined, apiClient,)

export const getSelectableCategories = async (): Promise<CategoryDto[]> => {
    const response = await categoriesApi.categoryControllerFindSelectable()
    return response.data.data
}