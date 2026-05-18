import { useMutation, useQuery } from "@tanstack/react-query"
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

export const useValidateResetTokenQuery = (
    token: string,
    enabled: boolean,
) => {
    return useQuery({
        queryKey: ["validate-reset-token", token],
        queryFn: () => validateResetToken({ token }),
        enabled: enabled && !!token,
        retry: false,
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