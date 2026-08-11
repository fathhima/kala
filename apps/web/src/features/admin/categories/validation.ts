import { z } from 'zod'
import { getValidationErrors, type ValidationErrors } from '@/utils/validation'

export type CategoryFormFields = 'name' | 'slug' | 'description' | 'sortOrder'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const optionalTrimmedString = z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))

export const categoryFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(80, 'Name must be 80 characters or less'),

    slug: optionalTrimmedString.refine(
        (value) => !value || slugRegex.test(value),
        'Slug can only contain lowercase letters, numbers, and hyphens',
    ),

    description: z
        .string()
        .trim()
        .max(300, 'Description must be 300 characters or less')
        .optional(),

    sortOrder: z
        .coerce
        .number()
        .int('Sort order must be a whole number')
        .min(0, 'Sort order cannot be negative')
        .max(9999, 'Sort order is too large'),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

export const validateCategoryForm = (data: {
    name: string
    slug?: string
    description?: string
    sortOrder: string | number
}): ValidationErrors<CategoryFormFields> => {
    return getValidationErrors<CategoryFormFields>(
        categoryFormSchema.safeParse(data),
    )
}

export const validateSubcategoryForm = validateCategoryForm