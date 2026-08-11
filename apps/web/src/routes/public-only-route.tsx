import { useAuthStore } from '@/features/auth/store'
import { Navigate } from 'react-router-dom'

interface PublicOnlyRouteProps {
    children: React.ReactNode
    redirectTo?: string
}

export function PublicOnlyRoute({ children, redirectTo = '/admin', }: PublicOnlyRouteProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />
    }

    return <>{children}</>
}