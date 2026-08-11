import { useAuthStore } from "@/features/auth/store"
import { AppRole } from "@/types/role.type"
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
    children: React.ReactNode
    requireRole?: AppRole
    loginPath?: string
}

export function ProtectedRoute({ children, requireRole, loginPath = '/login' }: ProtectedRouteProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const user = useAuthStore((state) => state.user)

    if (!isAuthenticated) {
        return <Navigate to={loginPath} replace />
    }

    if (requireRole && !user?.roles.includes(requireRole)) {
        if (user?.roles.includes('ADMIN')) return <Navigate to="/admin" replace />
        if (user?.roles.includes('INSTRUCTOR')) return <Navigate to="/instructor" replace />

        return <Navigate to="/dashboard" replace />
    }
    return <>{children}</>
}