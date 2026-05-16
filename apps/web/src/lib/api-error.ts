import { ApiErrorResponse } from '@/types/api-error-response.type'
import axios from 'axios'

export function getApiErrorResponse(error: unknown, fallback = 'Something went wrong') {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as ApiErrorResponse | undefined

        if (Array.isArray(data?.message)) {
            return data.message.join(",")
        }

        if (typeof data?.message === 'string' && data.message.trim()) {
            return data.message
        }

        if (error instanceof Error && error.message.trim()) {
            return error.message
        }
    }
    return fallback
}