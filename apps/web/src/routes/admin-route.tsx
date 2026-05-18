import { useAuthStore } from "@/features/auth/store"
import { Navigate } from "react-router-dom"

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (!user?.roles.includes('ADMIN')) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}