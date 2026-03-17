import { AuthenticationApi } from "@/api"
import { apiClient } from "@/api/axios"
import { apiConfig } from "@/api/client"
import { handleRequest } from "@/utils/handleRequest"

export const authApi = new AuthenticationApi(apiConfig,undefined,apiClient)

export const AuthService = {
    me: () => handleRequest(() => authApi.authControllerMe()),
    login: (email: string, password: string) => handleRequest(() => authApi.authControllerLogin({ email, password })),
    adminLogin: (email: string, password: string) => handleRequest(() => authApi.authControllerAdminLogin({ email, password })),
    register: (name: string, email: string, password: string) => handleRequest(() => authApi.authControllerRegister({ name, email, password })),
    verifyOtp: (email: string, otp: string) => handleRequest(() => authApi.authControllerVerifyOtp({ email, otp })),
    resendOtp: (email: string) => handleRequest(() => apiClient.post('/api/auth/resend-otp', { email })),
    logout: () => handleRequest(() => apiClient.post<{ message: string }>('/api/auth/logout'))

}