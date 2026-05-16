
export type ApiErrorResponse = {
    success?: boolean;
    message?: string | string[];
    statusCode?: number;
    error?: {
        code?: string
    }
}