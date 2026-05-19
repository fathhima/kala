import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AdminUsersQuery, getAdminUsers, updateAdminUserStatus } from '../api'

export const useAdminUsersQuery = (query: AdminUsersQuery) => {
    return useQuery({
        queryKey: ['admin-users', query],
        queryFn: () => getAdminUsers(query),
        placeholderData: (previousData) => previousData,
    })
}

export const useUpdateAdminUserStatusMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateAdminUserStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        },
    })
}