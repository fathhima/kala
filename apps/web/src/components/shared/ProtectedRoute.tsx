import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import type { Role } from '../../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: Role
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (requireRole && !user.roles.includes(requireRole)) {
    if (requireRole === 'ADMIN') return <Navigate to="/" replace />
    if (requireRole === 'INSTRUCTOR') return <Navigate to="/dashboard" replace />
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
