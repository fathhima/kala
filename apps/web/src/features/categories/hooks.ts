import { useQuery } from '@tanstack/react-query'
import { getSelectableCategories } from './api'

export const useCategoriesQuery = () =>
    useQuery({
        queryKey: ['categories', 'selectable'],
        queryFn: getSelectableCategories,
        staleTime: 10 * 60 * 1000,
    })

export const useSelectableCategoriesQuery = useCategoriesQuery
