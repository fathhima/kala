import { useQuery } from '@tanstack/react-query'
import {
    getPublicCategories,
    getPublicInstructor,
    getPublicInstructors,
} from './api'

export const usePublicCategoriesQuery = () =>
    useQuery({
        queryKey: ['public-categories'],
        queryFn: getPublicCategories,
        staleTime: 10 * 60 * 1000,
    })

export const usePublicInstructorsQuery = (params: {
    page: number
    limit: number
    search?: string
    subcategoryId?: string
}) =>
    useQuery({
        queryKey: ['public-instructors', params],
        queryFn: () => getPublicInstructors(params),
    })

export const usePublicInstructorQuery = (profileId: string) =>
    useQuery({
        queryKey: ['public-instructor', profileId],
        queryFn: () => getPublicInstructor(profileId),
        enabled: Boolean(profileId),
    })