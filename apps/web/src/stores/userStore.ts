import { create } from 'zustand'
import { UserService } from '@/services/user.service'
import type { User } from '../types'

interface UserState {
  user: User | null
  isLoading: boolean
  error: string | null
  success: string | null
  updateName: (userId: string, name: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>
  setUser: (user: User | null) => void
  clearMessages: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  success: null,

  updateName: async (userId: string, name: string) => {
    set({ isLoading: true, error: null, success: null })
    try {
      const { data, error } = await UserService.updateProfile(userId, { name })
      if (error) {
        set({
          error: error.message || 'Failed to update profile',
          isLoading: false,
        })
        return
      }
      set({
        user: data,
        success: 'Profile updated successfully',
        isLoading: false,
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to update profile',
        isLoading: false,
      })
    }
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    set({ isLoading: true, error: null, success: null })

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      set({
        error: 'Passwords do not match',
        isLoading: false,
      })
      return
    }

    // Validate password length
    if (newPassword.length < 8) {
      set({
        error: 'New password must be at least 8 characters',
        isLoading: false,
      })
      return
    }

    try {
      const { error } = await UserService.changePassword(currentPassword, newPassword)
      if (error) {
        set({
          error: error.message || 'Failed to change password',
          isLoading: false,
        })
        return
      }
      set({
        success: 'Password changed successfully',
        isLoading: false,
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to change password',
        isLoading: false,
      })
    }
  },

  setUser: (user) => set({ user }),

  clearMessages: () => set({ error: null, success: null }),
}))
