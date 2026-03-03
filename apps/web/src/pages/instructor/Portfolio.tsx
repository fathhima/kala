import { useState } from 'react'
import { Plus, Trash2, Upload, VideoIcon, ImageIcon } from 'lucide-react'
import { useInstructorStore } from '../../stores/instructorStore'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { cn } from '../../lib/utils'
import type { PortfolioItem } from '../../types'

export function Portfolio() {
  const { profile, setProfile } = useInstructorStore()

  const [items, setItems] = useState<PortfolioItem[]>(profile?.portfolioItems || [])
  const [activeSkillId, setActiveSkillId] = useState<string>(profile?.skills[0]?.id ?? '')

  // Modal state
  const [open, setOpen] = useState(false)
  const [caption, setCaption] = useState('')
  const [modalSkillId, setModalSkillId] = useState<string>(profile?.skills[0]?.id ?? '')
  const [modalType, setModalType] = useState<'photo' | 'video'>('photo')

  const skills = profile?.skills ?? []
  const hasMultipleSkills = skills.length > 1

  const activeSkill = skills.find((s) => s.id === activeSkillId)

  const photosForSkill = items.filter((i) => i.skillId === activeSkillId && i.type !== 'video')
  const videosForSkill = items.filter((i) => i.skillId === activeSkillId && i.type === 'video')

  const openModal = () => {
    setModalSkillId(activeSkillId)
    setModalType('photo')
    setCaption('')
    setOpen(true)
  }

  const addItem = (e: React.FormEvent) => {
    e.preventDefault()
    const seed = Date.now()
    const newItem: PortfolioItem = {
      id: `portfolio-${seed}`,
      instructorId: profile?.id || 'inst1',
      skillId: modalSkillId,
      type: modalType,
      imageUrl: `https://picsum.photos/seed/${seed}/400/300`,
      caption: caption.trim() || undefined,
    }
    const updated = [...items, newItem]
    setItems(updated)
    if (profile) setProfile({ ...profile, portfolioItems: updated })
    setOpen(false)
  }

  const deleteItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id)
    setItems(updated)
    if (profile) setProfile({ ...profile, portfolioItems: updated })
  }

  const totalForSkill = photosForSkill.length + videosForSkill.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">Portfolio</h1>
          <p className="text-stone-500 text-sm mt-1">
            {items.length} item{items.length !== 1 ? 's' : ''} across all skills
          </p>
        </div>
        <Button onClick={openModal} className="gap-2">
          <Plus size={16} /> Add Item
        </Button>
      </div>

      {/* Skill tabs */}
      {hasMultipleSkills && (
        <div className="flex gap-2 flex-wrap">
          {skills.map((skill) => {
            const count = items.filter((i) => i.skillId === skill.id).length
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => setActiveSkillId(skill.id)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                  activeSkillId === skill.id
                    ? 'bg-kala-amber text-white border-kala-amber'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-kala-amber hover:text-kala-brown'
                )}
              >
                {skill.name}
                {count > 0 && (
                  <span className={cn(
                    'ml-2 text-xs px-1.5 py-0.5 rounded-full',
                    activeSkillId === skill.id ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {totalForSkill === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl">
          <Upload size={40} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 mb-1">No items for {activeSkill?.name ?? 'this skill'} yet</p>
          <p className="text-xs text-stone-400 mb-4">Add photos and videos to showcase your work</p>
          <Button onClick={openModal} className="gap-2">
            <Plus size={16} /> Add First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Photos */}
          {photosForSkill.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon size={15} className="text-stone-400" />
                <h3 className="text-sm font-semibold text-stone-600 uppercase tracking-wide">
                  Photos
                </h3>
                <span className="text-xs text-stone-400">({photosForSkill.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {photosForSkill.map((item) => (
                  <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-square">
                    <img
                      src={item.imageUrl}
                      alt={item.caption || ''}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                      {item.caption && (
                        <p className="text-white text-xs font-medium text-center">{item.caption}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Videos */}
          {videosForSkill.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <VideoIcon size={15} className="text-stone-400" />
                <h3 className="text-sm font-semibold text-stone-600 uppercase tracking-wide">
                  Videos
                </h3>
                <span className="text-xs text-stone-400">({videosForSkill.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {videosForSkill.map((item) => (
                  <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-video bg-stone-800">
                    <img
                      src={item.imageUrl}
                      alt={item.caption || ''}
                      className="w-full h-full object-cover opacity-70"
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <div className="w-0 h-0 border-t-[7px] border-b-[7px] border-l-[14px] border-t-transparent border-b-transparent border-l-white ml-1" />
                      </div>
                    </div>
                    {/* Delete on hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {item.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                        <p className="text-white text-xs truncate">{item.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Add Item Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Portfolio Item">
        <form onSubmit={addItem} className="space-y-4">

          {/* Skill selector (if multiple skills) */}
          {hasMultipleSkills && (
            <div>
              <p className="text-sm font-medium text-stone-700 mb-2">Skill</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => setModalSkillId(skill.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                      modalSkillId === skill.id
                        ? 'bg-kala-amber text-white border-kala-amber'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-kala-amber'
                    )}
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Type selector */}
          <div>
            <p className="text-sm font-medium text-stone-700 mb-2">Type</p>
            <div className="flex gap-3">
              {(['photo', 'video'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setModalType(t)}
                  className={cn(
                    'flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl border text-sm font-medium transition-all',
                    modalType === t
                      ? 'bg-kala-amber text-white border-kala-amber'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-kala-amber'
                  )}
                >
                  {t === 'photo' ? <ImageIcon size={14} /> : <VideoIcon size={14} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Upload area */}
          <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center hover:border-kala-amber transition-colors cursor-pointer">
            {modalType === 'photo' ? (
              <ImageIcon size={24} className="text-stone-300 mx-auto mb-2" />
            ) : (
              <VideoIcon size={24} className="text-stone-300 mx-auto mb-2" />
            )}
            <p className="text-sm text-stone-500">
              Click to upload {modalType === 'photo' ? 'image' : 'video'}
            </p>
            <p className="text-xs text-stone-400 mt-1">(Using random placeholder for demo)</p>
          </div>

          <Input
            label="Caption (optional)"
            placeholder="Describe this work"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">Add to Portfolio</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
