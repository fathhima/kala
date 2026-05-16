import { useMutation, useQuery } from "@tanstack/react-query"
import { getMe, loginUser, logoutAllSessions, logoutCurrentSession, registerUser, resendOtp, verifyOtp } from "./api"

export const useRegisterMutation = () => {
    return useMutation({
        mutationFn: registerUser
    })
}

export const useVerifyOtpMutation = () => {
    return useMutation({
        mutationFn: verifyOtp
    })
}

export const useResendOtpMutation = () => {
    return useMutation({
        mutationFn: resendOtp
    })
}

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: loginUser
    })
}

export const useLogoutMutation = () =>
    useMutation({ mutationFn: logoutCurrentSession });

export const useLogoutAllMutation = () =>
    useMutation({ mutationFn: logoutAllSessions });

export const useMeQuery = (enabled: boolean) => {
    return useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        enabled,
        retry: false
    })
}