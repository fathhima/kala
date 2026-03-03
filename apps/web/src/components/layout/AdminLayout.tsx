import { Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Sparkles, CheckCircle, CalendarDays, CreditCard, Menu, LogOut } from 'lucide-react'
import { DashboardSidebar } from './DashboardSidebar'
import { useAuthStore } from '../../stores/authStore'
import { Avatar } from '../ui/Avatar'
import { useUIStore } from '../../stores/uiStore'

const navItems = [
  { label: 'Overview', path: '/admin', icon: <LayoutDashboard size={18} /> },
  { label: 'Applications', path: '/admin/applications', icon: <CheckCircle size={18} /> },
  { label: 'Skills', path: '/admin/skills', icon: <Sparkles size={18} /> },
  { label: 'Users', path: '/admin/users', icon: <Users size={18} /> },
  { label: 'Bookings', path: '/admin/bookings', icon: <CalendarDays size={18} /> },
  { label: 'Payments', path: '/admin/payments', icon: <CreditCard size={18} /> },
]

export function AdminLayout() {
  const { user, logout } = useAuthStore()
  const { toggleSidebar } = useUIStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-stone-50">
      <DashboardSidebar navItems={navItems} role="admin" />
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-100 h-14 flex items-center px-4 gap-3">
          <button className="lg:hidden p-2 rounded-lg hover:bg-stone-100 text-stone-500" onClick={toggleSidebar}>
            <Menu size={20} />
          </button>
          <span className="text-xs font-semibold text-kala-rose bg-red-50 px-2 py-0.5 rounded-full">Admin</span>
          <div className="ml-auto flex items-center gap-3">
            {user && (
              <>
                <span className="text-sm text-stone-600 hidden sm:block">{user.name}</span>
                <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                <button onClick={() => { logout(); navigate('/login') }} className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-red-500 transition-colors" title="Logout">
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
