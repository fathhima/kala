import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'
import { AuthService } from '@/services/auth.service'

interface AuthState {
  user: User | null
  error: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  adminLogin: (email: string, password: string) => Promise<void>
  fetchUser: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      error: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        const { error } = await AuthService.login(email, password)
        if (error) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          })
          return
        }
        set({ isLoading: false, isAuthenticated: true, error: null })
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        const { data, error } = await AuthService.register(name, email, password)
        if (error) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          })
          return
        }
        set({ isLoading: false, isAuthenticated: true, error: null })
      },

      adminLogin: async (email, password) => {
        set({ isLoading: true, error: null, isAuthenticated: false, user: null })
        const { error } = await AuthService.adminLogin(email, password)
        if (error) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          })
          return
        }
        set({ isLoading: false, isAuthenticated: true, error: null })
      },

      fetchUser: async () => {
        if (!get().isAuthenticated) return
        set({ isLoading: true, error: null })
        const { data, error } = await AuthService.me()
        if (error) {
          if (error.status === 401) {
            set({ user: null, isAuthenticated: false, error: null, isLoading: false })
          } else {
            set({ error: error.message || 'Failed to fetch user', isLoading: false })
          }
          return
        }
        set({ user: data, isAuthenticated: true, error: null, isLoading: false })
      },

      logout: async () => {
        await AuthService.logout()
        set({ user: null, isAuthenticated: false, error: null, isLoading: false })
      },
    }),
    {
      name: 'kala-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)