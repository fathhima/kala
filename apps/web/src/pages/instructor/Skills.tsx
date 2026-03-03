import { useState } from 'react'
import { Plus, X, Check } from 'lucide-react'
import { useInstructorStore } from '../../stores/instructorStore'
import { useSkillStore } from '../../stores/skillStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/utils'
import type { Skill } from '../../types'

const skillEmojis: Record<string, string> = {
  painting: '🎨', mehendi: '🌿', calligraphy: '✍️',
  'resin-art': '💎', 'clay-modelling': '🏺', 'handmade-crafts': '🧶',
}

export function InstructorSkills() {
  const { profile, setProfile } = useInstructorStore()
  const { skills: allSkills, addSkill } = useSkillStore()
  const [mySkills, setMySkills] = useState<Skill[]>(profile?.skills || [])
  const [saved, setSaved] = useState(false)

  // Custom skill input
  const [customInput, setCustomInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const isAdded = (id: string) => mySkills.some((s) => s.id === id)

  const add = (skill: Skill) => {
    if (!isAdded(skill.id)) {
      setMySkills((prev) => [...prev, skill])
      setSaved(false)
    }
  }

  const remove = (id: string) => {
    setMySkills((prev) => prev.filter((s) => s.id !== id))
    setSaved(false)
  }

  const handleAddCustom = () => {
    const name = customInput.trim()
    if (!name) return
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    // Check it doesn't duplicate an existing skill name
    const existing = allSkills.find((s) => s.slug === slug || s.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      add(existing)
    } else {
      const newSkill: Skill = { id: `skill-${Date.now()}`, name, slug }
      addSkill(newSkill)
      setMySkills((prev) => [...prev, newSkill])
      setSaved(false)
    }
    setCustomInput('')
    setShowCustomInput(false)
  }

  const save = () => {
    if (profile) setProfile({ ...profile, skills: mySkills })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const unadded = allSkills.filter((s) => !isAdded(s.id))

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-kala-brown">Skills Management</h1>
        <p className="text-stone-500 text-sm mt-1">
          Add the skills you teach. Each skill gets its own portfolio, pricing, and availability.
        </p>
      </div>

      {/* Current skills */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-4">Your Skills</h2>
        {mySkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {mySkills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-2 bg-kala-amber/10 border border-kala-amber/20 text-kala-brown px-3.5 py-2 rounded-2xl text-sm font-medium"
              >
                <span>{skillEmojis[skill.slug] || '🎭'}</span>
                {skill.name}
                <button
                  type="button"
                  onClick={() => remove(skill.id)}
                  className="ml-0.5 text-kala-terracotta hover:text-red-500 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400 italic">No skills added yet — pick from below or create your own.</p>
        )}
      </Card>

      {/* Available + custom skill */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-4">Add a Skill</h2>

        <div className="flex flex-wrap gap-2">
          {/* Predefined unadded skills */}
          {unadded.map((skill) => (
            <button
              key={skill.id}
              type="button"
              onClick={() => add(skill)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-stone-200 text-stone-600 hover:border-kala-amber hover:bg-amber-50 hover:text-kala-brown text-sm font-medium transition-all"
            >
              <span>{skillEmojis[skill.slug] || '🎭'}</span>
              {skill.name}
              <Plus size={13} className="text-stone-400" />
            </button>
          ))}

          {/* Custom skill toggle */}
          {!showCustomInput && (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 hover:border-kala-amber hover:text-kala-brown text-sm font-medium transition-all"
            >
              <Plus size={13} /> Add your own
            </button>
          )}

          {unadded.length === 0 && !showCustomInput && (
            <p className="text-sm text-stone-400 my-1">All preset skills added.</p>
          )}
        </div>

        {/* Custom skill input row */}
        {showCustomInput && (
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustom() } }}
              placeholder="e.g. Warli Painting, Block Print…"
              autoFocus
              className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-kala-amber focus:bg-white transition-colors"
            />
            <button
              type="button"
              onClick={handleAddCustom}
              disabled={!customInput.trim()}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                customInput.trim()
                  ? 'bg-kala-amber text-white hover:bg-amber-500'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              )}
            >
              <Check size={14} /> Add
            </button>
            <button
              type="button"
              onClick={() => { setShowCustomInput(false); setCustomInput('') }}
              className="p-2.5 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </Card>

      <Button onClick={save} disabled={saved}>
        {saved ? '✓ Saved!' : 'Save Skills'}
      </Button>
    </div>
  )
}
