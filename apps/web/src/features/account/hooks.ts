import { useMutation } from '@tanstack/react-query'
import { changeMyPassword, updateMyProfile } from './api'

export const useUpdateMyProfileMutation = () =>
    useMutation({
        mutationFn: updateMyProfile,
    })

export const useChangeMyPasswordMutation = () =>
    useMutation({
        mutationFn: changeMyPassword,
    })