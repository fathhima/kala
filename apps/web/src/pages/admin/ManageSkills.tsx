import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useSkillStore } from '../../stores/skillStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Input'
import type { Skill } from '../../types'

const skillEmojis: Record<string, string> = {
  painting: '🎨', mehendi: '🌿', calligraphy: '✍️', 'resin-art': '💎', 'clay-modelling': '🏺', 'handmade-crafts': '🧶',
}

export function ManageSkills() {
  const { skills, addSkill, deleteSkill } = useSkillStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const skill: Skill = {
      id: `skill-${Date.now()}`,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description: description || undefined,
    }
    addSkill(skill)
    setOpen(false)
    setName('')
    setSlug('')
    setDescription('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">Manage Skills</h1>
          <p className="text-stone-500 text-sm mt-1">{skills.length} skills in catalog</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus size={16} /> Add Skill
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <Card key={skill.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{skillEmojis[skill.slug] || '🎭'}</span>
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm">{skill.name}</h3>
                  <p className="text-xs text-stone-400">/{skill.slug}</p>
                </div>
              </div>
              <button
                onClick={() => deleteSkill(skill.id)}
                className="p-1.5 text-stone-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
            {skill.description && (
              <p className="text-xs text-stone-500 mt-3 leading-relaxed line-clamp-2">{skill.description}</p>
            )}
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add New Skill">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Skill Name" placeholder="Watercolor Painting" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Slug" placeholder="watercolor-painting (auto-generated)" value={slug} onChange={(e) => setSlug(e.target.value)} hint="URL-friendly identifier" />
          <Textarea label="Description" placeholder="Short description of this skill" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">Add Skill</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
