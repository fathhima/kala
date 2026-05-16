import { Role } from "@/api";
import { create } from "zustand";

export interface AuthUser {
    id: string,
    name: string,
    email: string,
    roles: Role[],
    imageUrl?: string | null,
    isActive: boolean,
    isVerified: boolean
}

interface AuthState {
    user: AuthUser | null,
    accessToken: string | null
    isAuthenticated: boolean,
    isAuthResolved: boolean,
    setAccessToken: (token: string | null) => void,
    setAuth: (user: AuthUser, accessToken: string) => void,
    clearAuth: () => void,
    markAuthResolved: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isAuthResolved: false,

    setAccessToken: (token) =>
        set((state) => ({
            ...state,
            accessToken: token,
            isAuthenticated: !!token && !!state.user,
        })),

    setAuth: (user, accessToken) =>
        set({
            user,
            accessToken,
            isAuthenticated: true,
            isAuthResolved: true,
        }),

    clearAuth: () =>
        set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isAuthResolved: true,
        }),

    markAuthResolved: () =>
        set((state) => ({
            ...state,
            isAuthResolved: true
        }))
}))