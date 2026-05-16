import { ApiEnvelope, refreshAuthApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const refreshClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

type RetryConfig = InternalAxiosRequestConfig & {
    _retry?: boolean
}

let refreshPromise: Promise<string> | null = null

apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

apiClient.interceptors.response.use((response) => response, async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error)
    }

    const url = originalRequest.url ?? ''
    const isAuthRequest =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/verify-otp') ||
        url.includes('/auth/resend-otp') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/logout')

    if (isAuthRequest) {
        return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
        if (!refreshPromise) {
            refreshPromise = refreshAuthApi.authControllerRefresh().then((refreshResponse) => {
                const payload = refreshResponse.data as unknown as ApiEnvelope<{ accessToken: string }>
                return payload.data.accessToken
            })
        }

        const newAccessToken = await refreshPromise

        useAuthStore.getState().setAccessToken(newAccessToken)

        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return apiClient(originalRequest)
    } catch (refreshError) {
        useAuthStore.getState().clearAuth()
        return Promise.reject(refreshError)
    } finally {
        refreshPromise = null
    }
})