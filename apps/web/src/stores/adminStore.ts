import { create } from 'zustand'
import { mockInstructors, mockUser, pendingInstructors } from '../lib/mock'
import type { InstructorProfile, User } from '../types'

const initialUsers: User[] = [
  mockUser,
  ...mockInstructors.map((instructor) => instructor.user),
  {
    id: 'user-admin1',
    name: 'Admin User',
    email: 'admin@kala.app',
    roles: ['ADMIN'],
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
  },
]

interface AdminState {
  users: User[]
  applications: InstructorProfile[]
  approvedApplicationIds: string[]
  rejectedApplicationIds: string[]
  toggleUserBlocked: (id: string) => void
  approveApplication: (id: string) => void
  rejectApplication: (id: string) => void
}

export const useAdminStore = create<AdminState>((set) => ({
  users: initialUsers,
  applications: pendingInstructors,
  approvedApplicationIds: [],
  rejectedApplicationIds: [],
  toggleUserBlocked: (id) =>
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, isActive: !user.isActive } : user)),
    })),
  approveApplication: (id) =>
    set((state) => ({
      approvedApplicationIds: state.approvedApplicationIds.includes(id)
        ? state.approvedApplicationIds
        : [...state.approvedApplicationIds, id],
      rejectedApplicationIds: state.rejectedApplicationIds.filter((value) => value !== id),
    })),
  rejectApplication: (id) =>
    set((state) => ({
      rejectedApplicationIds: state.rejectedApplicationIds.includes(id)
        ? state.rejectedApplicationIds
        : [...state.rejectedApplicationIds, id],
      approvedApplicationIds: state.approvedApplicationIds.filter((value) => value !== id),
    })),
}))
