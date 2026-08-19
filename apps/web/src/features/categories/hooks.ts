import { useQuery } from '@tanstack/react-query'
import { getSelectableCategories } from './api'

export const useSelectableCategoriesQuery = () =>
    useQuery({
        queryKey: ['selectable-categories'],
        queryFn: getSelectableCategories,
        staleTime: 10 * 60 * 1000,
    })