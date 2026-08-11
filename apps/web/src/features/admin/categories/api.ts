import {
    AdminCategoriesApi, Configuration, RequestCategoryImageUploadDtoMimeTypeEnum, type CategoryDto, type CategoryImageUploadDataDto, type ConfirmCategoryImageUploadDto,
    type CreateCategoryDto, type CreateSubcategoryDto, type SubcategoryDto, type SubcategoryImageUploadDataDto, type UpdateCategoryDto,
    type UpdateSubcategoryDto
} from '@/api'
import { apiClient } from '@/lib/axios'
import { CategoryFormValues } from './types/create-category-form-values.type'
import { UpdateCategoryFormValues } from './types/update-category-form-values.type'
import { SubcategoryFormValues } from './types/create-subcategory-form-values.type'
import { UpdateSubcategoryFormValues } from './types/update-subcategory-form-values.type'

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

export const getAdminCategories = async (): Promise<CategoryDto[]> => {
    const response = await adminCategoriesApi.categoryControllerFindAll()
    return response.data.data
}

export const createAdminCategory = async (values: CategoryFormValues,): Promise<CategoryDto> => {
    const response = await adminCategoriesApi.categoryControllerCreateCategory(toCreatePayload(values),)
    return response.data.data
}

export const updateAdminCategory = async (params: { categoryId: string, values: UpdateCategoryFormValues }): Promise<CategoryDto> => {
    const response = await adminCategoriesApi.categoryControllerUpdateCategory(params.categoryId, toUpdateCategoryPayload(params.values),)
    return response.data.data
}

export const createAdminSubcategory = async (params: { categoryId: string, values: SubcategoryFormValues }): Promise<SubcategoryDto> => {
    const response = await adminCategoriesApi.categoryControllerCreateSubcategory(params.categoryId, toCreateSubcategoryPayload(params.values),)
    return response.data.data
}

export const updateAdminSubcategory = async (params: { categoryId: string, subcategoryId: string, values: UpdateSubcategoryFormValues }): Promise<SubcategoryDto> => {
    const response = await adminCategoriesApi.categoryControllerUpdateSubcategory(
        params.categoryId,
        params.subcategoryId,
        toUpdateSubcategoryPayload(params.values),
    )
    return response.data.data
}

export const getCategoryImageViewUrl = async (categoryId: string) => {
    const response = await adminCategoriesApi.categoryControllerGetCategoryImageViewUrl(categoryId)
    return response.data.data
}

export const getSubcategoryImageViewUrl = async (categoryId: string, subcategoryId: string,) => {
    const response = await adminCategoriesApi.categoryControllerGetSubcategoryImageViewUrl(
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
    const uploadResponse = await adminCategoriesApi.categoryControllerCreateCategoryImageUploadUrl(
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

    const confirmResponse = await adminCategoriesApi.categoryControllerConfirmCategoryImageUpload(
        params.categoryId,
        confirmPayload,
    )

    return confirmResponse.data.data
}

export const removeCategoryImage = async (categoryId: string): Promise<CategoryDto> => {
    const response = await adminCategoriesApi.categoryControllerRemoveCategoryImage(categoryId)
    return response.data.data
}

export const uploadSubcategoryImage = async (params: { categoryId: string, subcategoryId: string, file: File }): Promise<SubcategoryDto> => {
    const uploadResponse = await adminCategoriesApi.categoryControllerCreateSubcategoryImageUploadUrl(
        params.categoryId,
        params.subcategoryId,
        {
            mimeType: params.file.type as RequestCategoryImageUploadDtoMimeTypeEnum,
            sizeBytes: params.file.size,
        },
    )

    const upload: SubcategoryImageUploadDataDto = uploadResponse.data.data
    await uploadFileToSignedUrl(upload.uploadUrl, params.file)

    const confirmResponse = await adminCategoriesApi.categoryControllerConfirmSubcategoryImageUpload(
        params.categoryId,
        params.subcategoryId,
        { storageKey: upload.storageKey },
    )

    return confirmResponse.data.data
}

export const removeSubcategoryImage = async (params: { categoryId: string, subcategoryId: string }): Promise<SubcategoryDto> => {
    const response = await adminCategoriesApi.categoryControllerRemoveSubcategoryImage(
        params.categoryId,
        params.subcategoryId,
    )

    return response.data.data
}