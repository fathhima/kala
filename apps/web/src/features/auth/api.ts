import { AuthenticationApi, Configuration, ForgotPasswordDto, GoogleSignInRequestDto, LoginDto, RegisterDto, ResendOtpDto, ResetPasswordDto, SafeUserDto, ValidateResetTokenDto, VerifyOtpDto } from "@/api";
import { apiClient, refreshClient } from "@/lib/axios";
import { AuthUser } from "./store";
import { ApiEnvelope } from "@/types/api-envelope";

type MeResponseDto = SafeUserDto & {
    createdAt?: string;
    updatedAt?: string;
};

const config = new Configuration({
    basePath: import.meta.env.VITE_API_URL
})

const authApi = new AuthenticationApi(config, undefined, apiClient)

const mapUser = (user: SafeUserDto | MeResponseDto): AuthUser => ({
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    imageUrl: (user.imageUrl as string | null | undefined) ?? null,
    isActive: user.isActive,
    isVerified: user.isVerified,
    hasPassword: user.hasPassword
})

export const registerUser = async (payload: RegisterDto) => {
    const response = await authApi.authControllerRegister(payload)
    return response.data.data
}

export const verifyOtp = async (payload: VerifyOtpDto) => {
    const response = await authApi.authControllerVerifyOtp(payload)
    return {
        accessToken: response.data.data.accessToken,
        user: mapUser(response.data.data.user)
    }
}

export const resendOtp = async (payload: ResendOtpDto) => {
    const response = await authApi.authControllerResendOtp(payload)
    return response.data.data
}

export const loginUser = async (payload: LoginDto) => {
    const response = await authApi.authControllerLogin(payload)
    return {
        accessToken: response.data.data.accessToken,
        user: mapUser(response.data.data.user)
    }
}

export const forgotPassword = async (payload: ForgotPasswordDto) => {
    const response = await authApi.authControllerForgotPassword(payload);
    return (
        response.data.message ??
        "If an account exists, a password reset link has been sent."
    );
};

export const validateResetToken = async (payload: ValidateResetTokenDto) => {
    await authApi.authControllerValidateResetToken(payload);
    return true;
};

export const resetPassword = async (payload: ResetPasswordDto) => {
    const response = await authApi.authControllerResetPassword(payload);
    return response.data.message ?? "Password reset successfully";
};

export const getMe = async () => {
    const response = await authApi.authControllerMe()
    const payload = response.data as unknown as ApiEnvelope<MeResponseDto>
    return mapUser(payload.data)
}

export const refreshSession = async () => {
    const response = await refreshClient.post<ApiEnvelope<{ accessToken: string }>>("/api/auth/refresh");

    return response.data.data.accessToken;
};

export const googleSignin = async (payload: GoogleSignInRequestDto) => {
    const response = await authApi.authControllerGoogleSignin(payload);
    return {
        accessToken: response.data.data.accessToken,
        user: mapUser(response.data.data.user),
    };
};

export const logoutCurrentSession = async () => {
    await authApi.authControllerLogout()
}

export const logoutAllSessions = async () => {
    await authApi.authControllerLogoutAll()
}