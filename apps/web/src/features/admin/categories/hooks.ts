import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAdminCategory, createAdminSubcategory, getAdminCategories, getCategoryImageViewUrl, getSubcategoryImageViewUrl, removeCategoryImage, removeSubcategoryImage, updateAdminCategory, updateAdminSubcategory, uploadCategoryImage, uploadSubcategoryImage, } from './api'
import { AdminCategoriesQuery } from './types/category-query.type'

export const adminCategoriesQueryKey = ['admin-categories']

export const useAdminCategoriesQuery = (query: AdminCategoriesQuery) => {
    return useQuery({
        queryKey: ['admin-categories', query],
        queryFn: () => getAdminCategories(query),
        placeholderData: (previousData) => previousData,
    })
}
export const useCategoryImageViewUrlQuery = (categoryId: string, enabled: boolean,) => {
    return useQuery({
        queryKey: ['admin-category-image-view-url', categoryId],
        queryFn: () => getCategoryImageViewUrl(categoryId),
        enabled,
        staleTime: 10 * 60 * 1000,
    })
}

export const useSubcategoryImageViewUrlQuery = (categoryId: string, subcategoryId: string, enabled: boolean,) => {
    return useQuery({
        queryKey: ['admin-subcategory-image-view-url', categoryId, subcategoryId],
        queryFn: () => getSubcategoryImageViewUrl(categoryId, subcategoryId),
        enabled,
        staleTime: 10 * 60 * 1000,
    })
}

export const useCreateAdminCategoryMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createAdminCategory,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey }),
    })
}

export const useUpdateAdminCategoryMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateAdminCategory,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey }),
    })
}

export const useCreateAdminSubcategoryMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createAdminSubcategory,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey }),
    })
}

export const useUpdateAdminSubcategoryMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateAdminSubcategory,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey }),
    })
}

export const useUploadCategoryImageMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: uploadCategoryImage,
        onSuccess: (_data, variables) =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey }),
                queryClient.invalidateQueries({
                    queryKey: ['admin-category-image-view-url', variables.categoryId],
                }),
            ]),
    })
}

export const useRemoveCategoryImageMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: removeCategoryImage,
        onSuccess: (_data, categoryId) =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey }),
                queryClient.invalidateQueries({
                    queryKey: ['admin-category-image-view-url', categoryId],
                }),
            ]),
    })
}

export const useUploadSubcategoryImageMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: uploadSubcategoryImage,
        onSuccess: (_data, variables) =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey }),
                queryClient.invalidateQueries({
                    queryKey: [
                        'admin-subcategory-image-view-url',
                        variables.categoryId,
                        variables.subcategoryId,
                    ],
                }),
            ]),
    })
}

export const useRemoveSubcategoryImageMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: removeSubcategoryImage,
        onSuccess: (_data, variables) =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey }),
                queryClient.invalidateQueries({
                    queryKey: [
                        'admin-subcategory-image-view-url',
                        variables.categoryId,
                        variables.subcategoryId,
                    ],
                }),
            ]),
    })
}