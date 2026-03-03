import { create } from 'zustand'
import type { Skill } from '../types'
import { mockSkills } from '../lib/mock'

interface SkillState {
  skills: Skill[]
  setSkills: (skills: Skill[]) => void
  addSkill: (skill: Skill) => void
  deleteSkill: (id: string) => void
}

export const useSkillStore = create<SkillState>((set) => ({
  skills: mockSkills,
  setSkills: (skills) => set({ skills }),
  addSkill: (skill) => set((state) => ({ skills: [...state.skills, skill] })),
  deleteSkill: (id) => set((state) => ({ skills: state.skills.filter((s) => s.id !== id) })),
}))
