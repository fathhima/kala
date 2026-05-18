import { useAuthStore } from "@/features/auth/store"
import { Navigate } from "react-router-dom"

interface AdminPublicOnlyRouteProps {
    children: React.ReactNode
}

export function AdminPublicOnlyRoute({ children }: AdminPublicOnlyRouteProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const user = useAuthStore((state) => state.user)

    if (!isAuthenticated) {
        return <>{children}</>
    }

    if (user?.roles.includes('ADMIN')) {
        return <Navigate to="/admin" replace />
    }

    return <Navigate to="/" replace />
}