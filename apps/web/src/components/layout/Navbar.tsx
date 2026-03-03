import { Link, useNavigate } from 'react-router-dom'
import { Palette, Menu, X, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getDashboardLink = () => {
    if (!user) return '/dashboard'
    if (user.roles.includes('ADMIN')) return '/admin'
    if (user.roles.includes('INSTRUCTOR')) return '/instructor'
    return '/dashboard'
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-kala-brown font-bold text-xl">
            <Palette className="text-kala-amber" size={24} />
            Kala
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/skills" className="text-sm text-stone-600 hover:text-kala-terracotta transition-colors font-medium">
              Browse Skills
            </Link>
            <Link to="/instructors" className="text-sm text-stone-600 hover:text-kala-terracotta transition-colors font-medium">
              Instructors
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                  <span className="text-sm font-medium text-stone-700">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} className="text-stone-400" />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-100 py-1 z-20">
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <Link
                        to="/dashboard/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={15} /> Profile
                      </Link>
                      <hr className="my-1 border-stone-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-stone-100 text-stone-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-stone-100 space-y-2">
            <Link to="/skills" className="block px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg" onClick={() => setMobileOpen(false)}>
              Browse Skills
            </Link>
            <Link to="/instructors" className="block px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg" onClick={() => setMobileOpen(false)}>
              Instructors
            </Link>
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="block px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-3 pt-2">
                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Login</Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
