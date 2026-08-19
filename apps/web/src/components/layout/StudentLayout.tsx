import { Link, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Settings, Menu, LogOut, GraduationCap, } from 'lucide-react'
import { DashboardSidebar } from './DashboardSidebar'
import { Avatar } from '../ui/Avatar'
import { useUIStore } from '../../lib/uiStore'
import { useAuthStore } from '@/features/auth/store'
import { useLogoutMutation } from '@/features/auth/hooks'

const navItems = [
  { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Become an Instructor', path: '/dashboard/become-instructor', icon: <GraduationCap size={18} />, },
  { label: 'Profile Settings', path: '/dashboard/settings', icon: <Settings size={18} /> },
]

export function StudentLayout() {
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const logoutMutation = useLogoutMutation()
  const { toggleSidebar } = useUIStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <DashboardSidebar navItems={navItems} role="student" />

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-stone-100 bg-white/90 px-4 backdrop-blur-md">
          <button
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 lg:hidden"
            onClick={toggleSidebar}
            type="button"
          >
            <Menu size={20} />
          </button>

          <div className="ml-auto flex items-center gap-3">

            {user?.roles.includes('INSTRUCTOR') && (
              <Link
                to="/instructor"
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-800 sm:inline-flex"
              >
                <GraduationCap size={16} />
                Instructor Mode
              </Link>
            )}

            {user && (
              <>
                <span className="hidden text-sm text-stone-600 sm:block">
                  {user.name}
                </span>
                <Avatar name={user.name} src={user.imageUrl ?? undefined} size="sm" />
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-red-500"
                  title="Logout"
                  type="button"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}