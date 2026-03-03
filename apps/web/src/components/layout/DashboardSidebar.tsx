import { Link, useLocation } from 'react-router-dom'
import { X, Palette } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useUIStore } from '../../stores/uiStore'

export interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

interface SidebarProps {
  navItems: NavItem[]
  role: 'student' | 'instructor' | 'admin'
}

export function DashboardSidebar({ navItems, role }: SidebarProps) {
  const location = useLocation()
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  const roleColors = {
    student: 'text-kala-amber',
    instructor: 'text-kala-sage',
    admin: 'text-kala-rose',
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-5 border-b border-stone-100">
        <Link to="/" className="flex items-center gap-2 text-kala-brown font-bold text-lg">
          <Palette className={cn('shrink-0', roleColors[role])} size={22} />
          Kala
        </Link>
        <button
          className="lg:hidden p-1 rounded-lg hover:bg-stone-100 text-stone-400"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' &&
              item.path !== '/instructor' &&
              item.path !== '/admin' &&
              location.pathname.startsWith(item.path))

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-kala-amber/10 text-kala-terracotta'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
              )}
            >
              <span className={cn('shrink-0', isActive ? 'text-kala-terracotta' : 'text-stone-400')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:border-r lg:border-stone-100 bg-white z-30">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-60 bg-white shadow-xl z-50">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
