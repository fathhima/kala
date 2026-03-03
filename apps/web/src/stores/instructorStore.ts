import { create } from 'zustand'
import type { InstructorProfile, Slot } from '../types'
import { mockInstructors, mockSlots } from '../lib/mock'

interface InstructorState {
  profile: InstructorProfile | null
  slots: Slot[]
  instructors: InstructorProfile[]
  setProfile: (profile: InstructorProfile) => void
  setSlots: (slots: Slot[]) => void
  addSlot: (slot: Slot) => void
  deleteSlot: (id: string) => void
  setInstructors: (instructors: InstructorProfile[]) => void
}

export const useInstructorStore = create<InstructorState>((set) => ({
  profile: mockInstructors[0],
  slots: mockSlots.filter((s) => s.instructorId === 'inst1'),
  instructors: mockInstructors,
  setProfile: (profile) => set({ profile }),
  setSlots: (slots) => set({ slots }),
  addSlot: (slot) => set((state) => ({ slots: [...state.slots, slot] })),
  deleteSlot: (id) => set((state) => ({ slots: state.slots.filter((s) => s.id !== id) })),
  setInstructors: (instructors) => set({ instructors }),
}))
