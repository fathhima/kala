import { useAuthStore } from '@/features/auth/store'
import { Navigate } from 'react-router-dom'

interface PublicOnlyRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function PublicOnlyRoute({ children, redirectTo }: PublicOnlyRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (isAuthenticated) {
    if (redirectTo) return <Navigate to={redirectTo} replace />
    if (user?.roles.includes('ADMIN')) return <Navigate to="/admin" replace />
    if (user?.roles.includes('INSTRUCTOR')) return <Navigate to="/instructor" replace />

    return <Navigate to="/" replace />
  }

  return <>{children}</>
}