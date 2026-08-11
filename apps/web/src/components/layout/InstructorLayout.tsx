import { Link, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Image, Sparkles, Star, Settings, Menu, LogOut, Clock, CreditCard, ArrowLeftRight } from 'lucide-react'
import { DashboardSidebar } from './DashboardSidebar'
import { Avatar } from '../ui/Avatar'
import { useAuthStore } from '@/features/auth/store'
import { useUIStore } from '@/lib/uiStore'
import { useLogoutMutation } from '@/features/auth/hooks'

const navItems = [
  { label: 'Overview', path: '/instructor', icon: <LayoutDashboard size={18} /> },
  { label: 'Manage Slots', path: '/instructor/slots', icon: <CalendarDays size={18} /> },
  { label: 'My Sessions', path: '/instructor/sessions', icon: <Clock size={18} /> },
  { label: 'Portfolio', path: '/instructor/portfolio', icon: <Image size={18} /> },
  { label: 'Skills', path: '/instructor/skills', icon: <Sparkles size={18} /> },
  { label: 'Reviews', path: '/instructor/reviews', icon: <Star size={18} /> },
  { label: 'Payments', path: '/instructor/payments', icon: <CreditCard size={18} /> },
  { label: 'Profile Settings', path: '/instructor/settings', icon: <Settings size={18} /> },
]

export function InstructorLayout() {
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
      <DashboardSidebar navItems={navItems} role="instructor" />
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-100 h-14 flex items-center px-4 gap-3">
          <button className="lg:hidden p-2 rounded-lg hover:bg-stone-100 text-stone-500" onClick={toggleSidebar}>
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/dashboard" className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-800 sm:inline-flex">
              <ArrowLeftRight size={16} />
              Student mode
            </Link>

            {user && (
              <>
                <span className="text-sm text-stone-600 hidden sm:block">{user.name}</span>
                <Avatar name={user.name} src={user.imageUrl ?? undefined} size="sm" />
                <button type="button" onClick={handleLogout} disabled={logoutMutation.isPending} className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-red-500" title="Logout" aria-label="Logout">
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
