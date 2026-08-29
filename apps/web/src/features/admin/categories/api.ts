import {
    AdminCategoriesApi, Configuration, PaginatedCategoryDataDto, RequestCategoryImageUploadDtoMimeTypeEnum, type CategoryDto, type CategoryImageUploadDataDto, type ConfirmCategoryImageUploadDto,
    type CreateCategoryDto, type CreateSubcategoryDto, type SubcategoryDto, type SubcategoryImageUploadDataDto, type UpdateCategoryDto,
    type UpdateSubcategoryDto
} from '@/api'
import { apiClient } from '@/lib/axios'
import { CategoryFormValues } from './types/create-category-form-values.type'
import { UpdateCategoryFormValues } from './types/update-category-form-values.type'
import { SubcategoryFormValues } from './types/create-subcategory-form-values.type'
import { UpdateSubcategoryFormValues } from './types/update-subcategory-form-values.type'
import { AdminCategoriesQuery } from './types/category-query.type'

const config = new Configuration({ basePath: import.meta.env.VITE_API_URL, })

const adminCategoriesApi = new AdminCategoriesApi(config, undefined, apiClient)

export const allowedImageTypes = Object.values(RequestCategoryImageUploadDtoMimeTypeEnum)
export const maxImageSizeBytes = 5 * 1024 * 1024

const emptyToUndefined = (value?: string) => {
    const trimmed = value?.trim()
    return trimmed ? trimmed : undefined
}

const toCreatePayload = (values: CategoryFormValues): CreateCategoryDto => ({
    name: values.name.trim(),
    slug: emptyToUndefined(values.slug),
    description: emptyToUndefined(values.description),
    sortOrder: values.sortOrder,
})

const toUpdateCategoryPayload = (values: UpdateCategoryFormValues): UpdateCategoryDto => ({
    name: emptyToUndefined(values.name),
    slug: emptyToUndefined(values.slug),
    description: emptyToUndefined(values.description) as UpdateCategoryDto['description'],
    isActive: values.isActive,
    sortOrder: values.sortOrder,
})

const toCreateSubcategoryPayload = (values: SubcategoryFormValues): CreateSubcategoryDto => ({
    name: values.name.trim(),
    slug: emptyToUndefined(values.slug),
    description: emptyToUndefined(values.description),
    sortOrder: values.sortOrder,
})

const toUpdateSubcategoryPayload = (values: UpdateSubcategoryFormValues,): UpdateSubcategoryDto => ({
    name: emptyToUndefined(values.name),
    slug: emptyToUndefined(values.slug),
    description: emptyToUndefined(values.description) as UpdateSubcategoryDto['description'],
    isActive: values.isActive,
    sortOrder: values.sortOrder,
})

export const getAdminCategories = async (query: AdminCategoriesQuery,): Promise<PaginatedCategoryDataDto> => {
    const response = await adminCategoriesApi.adminCategoryControllerFindAll(
        query.page,
        query.limit,
        query.search,
        toBooleanString(query.isActive),
    )

    return response.data.data
}

export const createAdminCategory = async (values: CategoryFormValues,): Promise<CategoryDto> => {
    const response = await adminCategoriesApi.adminCategoryControllerCreateCategory(toCreatePayload(values),)
    return response.data.data
}

export const updateAdminCategory = async (params: { categoryId: string, values: UpdateCategoryFormValues }): Promise<CategoryDto> => {
    const response = await adminCategoriesApi.adminCategoryControllerUpdateCategory(params.categoryId, toUpdateCategoryPayload(params.values),)
    return response.data.data
}

export const createAdminSubcategory = async (params: { categoryId: string, values: SubcategoryFormValues }): Promise<SubcategoryDto> => {
    const response = await adminCategoriesApi.adminCategoryControllerCreateSubcategory(params.categoryId, toCreateSubcategoryPayload(params.values),)
    return response.data.data
}

export const updateAdminSubcategory = async (params: { categoryId: string, subcategoryId: string, values: UpdateSubcategoryFormValues }): Promise<SubcategoryDto> => {
    const response = await adminCategoriesApi.adminCategoryControllerUpdateSubcategory(
        params.categoryId,
        params.subcategoryId,
        toUpdateSubcategoryPayload(params.values),
    )
    return response.data.data
}

export const getCategoryImageViewUrl = async (categoryId: string) => {
    const response = await adminCategoriesApi.adminCategoryControllerGetCategoryImageViewUrl(categoryId)
    return response.data.data
}

export const getSubcategoryImageViewUrl = async (categoryId: string, subcategoryId: string,) => {
    const response = await adminCategoriesApi.adminCategoryControllerGetSubcategoryImageViewUrl(
        categoryId,
        subcategoryId,
    )

    return response.data.data
}

const uploadFileToSignedUrl = async (uploadUrl: string, file: File) => {
    const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type,
        },
        body: file,
    })

    if (!response.ok) {
        throw new Error('Image upload failed')
    }
}

export const uploadCategoryImage = async (params: { categoryId: string, file: File }): Promise<CategoryDto> => {
    const uploadResponse = await adminCategoriesApi.adminCategoryControllerCreateCategoryImageUploadUrl(
        params.categoryId,
        {
            mimeType: params.file.type as RequestCategoryImageUploadDtoMimeTypeEnum,
            sizeBytes: params.file.size,
        },
    )

    const upload: CategoryImageUploadDataDto = uploadResponse.data.data
    await uploadFileToSignedUrl(upload.uploadUrl, params.file)

    const confirmPayload: ConfirmCategoryImageUploadDto = {
        storageKey: upload.storageKey,
    }

    const confirmResponse = await adminCategoriesApi.adminCategoryControllerConfirmCategoryImageUpload(
        params.categoryId,
        confirmPayload,
    )

    return confirmResponse.data.data
}

export const removeCategoryImage = async (categoryId: string): Promise<CategoryDto> => {
    const response = await adminCategoriesApi.adminCategoryControllerRemoveCategoryImage(categoryId)
    return response.data.data
}

export const uploadSubcategoryImage = async (params: { categoryId: string, subcategoryId: string, file: File }): Promise<SubcategoryDto> => {
    const uploadResponse = await adminCategoriesApi.adminCategoryControllerCreateSubcategoryImageUploadUrl(
        params.categoryId,
        params.subcategoryId,
        {
            mimeType: params.file.type as RequestCategoryImageUploadDtoMimeTypeEnum,
            sizeBytes: params.file.size,
        },
    )

    const upload: SubcategoryImageUploadDataDto = uploadResponse.data.data
    await uploadFileToSignedUrl(upload.uploadUrl, params.file)

    const confirmResponse = await adminCategoriesApi.adminCategoryControllerConfirmSubcategoryImageUpload(
        params.categoryId,
        params.subcategoryId,
        { storageKey: upload.storageKey },
    )

    return confirmResponse.data.data
}

export const removeSubcategoryImage = async (params: { categoryId: string, subcategoryId: string }): Promise<SubcategoryDto> => {
    const response = await adminCategoriesApi.adminCategoryControllerRemoveSubcategoryImage(
        params.categoryId,
        params.subcategoryId,
    )

    return response.data.data
}

const toBooleanString = (value?: boolean): string | undefined => {
    if (typeof value !== 'boolean') return undefined
    return value ? 'true' : 'false'
}
