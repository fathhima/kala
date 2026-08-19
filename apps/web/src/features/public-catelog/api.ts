import {
    Configuration,
    PublicCatalogApi,
    type PublicCategoryDto,
    type PublicInstructorDto,
} from '@/api'
import { apiClient } from '@/lib/axios'

export type PublicCategory = {
    id: string
    name: string
    slug: string
    description: string | null
    subcategories: Array<{
        id: string
        name: string
        slug: string
        description: string | null
    }>
}

export type PublicInstructor = {
    id: string
    name: string
    imageUrl: string | null
    bio: string | null
    location: string | null
    offerings: Array<{
        id: string
        title: string | null
        description: string | null
        hourlyRate: string
        currency: string
        experienceYears: number | null
        subcategory: {
            id: string
            name: string
            slug: string
            category: {
                id: string
                name: string
                slug: string
            }
        }
        media: Array<{
            id: string
            type: 'IMAGE' | 'VIDEO'
            viewUrl: string
        }>
    }>
}

type PublicInstructorPage = {
    items: PublicInstructor[]
    meta: {
        page: number
        limit: number
        total: number
        hasNextPage: boolean
        hasPrevPage: boolean
    }
}

const configuration = new Configuration({
    basePath: import.meta.env.VITE_API_URL,
})

const publicCatalogApi = new PublicCatalogApi(
    configuration,
    undefined,
    apiClient,
)

const text = (value: unknown): string | null =>
    typeof value === 'string' ? value : null

const mapCategory = (category: PublicCategoryDto): PublicCategory => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: text(category.description),
    subcategories: category.subcategories.map((subcategory) => ({
        id: subcategory.id,
        name: subcategory.name,
        slug: subcategory.slug,
        description: text(subcategory.description),
    })),
})

const mapInstructor = (
    instructor: PublicInstructorDto,
): PublicInstructor => ({
    id: instructor.id,
    name: instructor.name,
    imageUrl: text(instructor.imageUrl),
    bio: text(instructor.bio),
    location: text(instructor.location),
    offerings: instructor.offerings.map((offering) => ({
        id: offering.id,
        title: text(offering.title),
        description: text(offering.description),
        hourlyRate: offering.hourlyRate,
        currency: offering.currency,
        experienceYears:
            typeof offering.experienceYears === 'number'
                ? offering.experienceYears
                : null,
        subcategory: offering.subcategory,
        media: offering.media.map((media) => ({
            id: media.id,
            type: media.type,
            viewUrl: media.viewUrl,
        })),
    })),
})

export const getPublicCategories = async (): Promise<PublicCategory[]> => {
    const response =
        await publicCatalogApi.publicCatalogControllerGetCategories()

    return response.data.data.map(mapCategory)
}

export const getPublicInstructors = async (params: {
    page: number
    limit: number
    search?: string
    subcategoryId?: string
}): Promise<PublicInstructorPage> => {
    const response =
        await publicCatalogApi.publicCatalogControllerGetInstructors(
            params.page,
            params.limit,
            params.search,
            params.subcategoryId,
        )

    return {
        items: response.data.data.items.map(mapInstructor),
        meta: response.data.data.meta,
    }
}

export const getPublicInstructor = async (
    profileId: string,
): Promise<PublicInstructor> => {
    const response =
        await publicCatalogApi.publicCatalogControllerGetInstructor(profileId)

    return mapInstructor(response.data.data)
}