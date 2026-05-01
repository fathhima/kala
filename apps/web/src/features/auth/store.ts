import { Role } from "@/api";
import { create } from "zustand";

interface AuthUser {
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
    isAuthenticated: boolean,
    setUser: (user: AuthUser | null) => void,
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    setUser: (user) =>
        set({
            user,
            isAuthenticated: !!user,
        }),
    clearAuth: () => {
        set({
            user: null,
            isAuthenticated: false
        })
    }
}))