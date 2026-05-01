import { AuthenticationApi, Configuration, LoginDto, RegisterDto, ResendOtpDto, VerifyOtpDto } from "@/api";
import { apiClient } from "@/lib/axios";

const config = new Configuration({
    basePath: import.meta.env.VITE_API_URL
})

const authApi = new AuthenticationApi(config, undefined, apiClient)

export const registerUser = async (payload: RegisterDto) => {
    const response = await authApi.authControllerRegister(payload)
    return response.data
}

export const verifyOtp = async (payload: VerifyOtpDto) => {
    const response = await authApi.authControllerVerifyOtp(payload)
    return response.data.data
}

export const resendOtp = async (payload: ResendOtpDto) => {
    const response = await authApi.authControllerResendOtp(payload)
    return response.data
}

export const loginUser = async (payload: LoginDto) => {
    const response = await authApi.authControllerLogin(payload)
    return response.data.data
}

export const getMe = async () => {
    const response = await authApi.authControllerMe()
    return response.data
}