import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { forgotPassword, getMe, googleSignin, loginUser, logoutAllSessions, logoutCurrentSession, registerUser, resendOtp, resetPassword, validateResetToken, verifyOtp } from "./api"

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

export const useForgotPasswordMutation = () => {
    return useMutation({
        mutationFn: forgotPassword,
    });
};

export const useValidateResetTokenMutation = () => {
    return useMutation({
        mutationFn: validateResetToken,
    });
};

export const useResetPasswordMutation = () => {
    return useMutation({
        mutationFn: resetPassword,
    });
};

export const useGoogleSigninMutation = () => {
    return useMutation({
        mutationFn: googleSignin,
    });
};

export const useLogoutMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logoutCurrentSession,
        onSuccess: () => queryClient.clear()
    });
};
export const useLogoutAllMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logoutAllSessions,
        onSuccess: () => queryClient.clear()
    });
};


export const useMeQuery = (enabled: boolean) => {
    return useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        enabled,
        retry: false
    })
}