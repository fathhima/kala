import { useAuthStore } from "@/features/auth/store"
import { Navigate } from "react-router-dom"

interface PublicOnlyRouteProps {
    children: React.ReactNode
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
