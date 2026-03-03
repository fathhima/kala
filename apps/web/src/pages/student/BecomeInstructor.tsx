import { useState, useRef } from 'react'
import {
  CheckCircle, Clock, ImagePlus, VideoIcon, X, Plus, Instagram,
} from 'lucide-react'
import { useSkillStore } from '../../stores/skillStore'
import { useAuthStore } from '../../stores/authStore'
import { Input, Textarea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { cn } from '../../lib/utils'

const skillEmojis: Record<string, string> = {
  painting: '🎨', mehendi: '🌿', calligraphy: '✍️',
  'resin-art': '💎', 'clay-modelling': '🏺', 'handmade-crafts': '🧶',
}

export function BecomeInstructor() {
  const { skills } = useSkillStore()
  const { user } = useAuthStore()

  // Mock: first-time if user has no INSTRUCTOR role yet.
  // In production, check if an instructor profile already exists via API.
  const isFirstTime = !user?.roles.includes('INSTRUCTOR')

  // First-time-only profile fields
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')

  // Skill selection
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customSkill, setCustomSkill] = useState('')
  const [confirmedCustomSkill, setConfirmedCustomSkill] = useState('')

  // Per-skill form fields
  const [instagram, setInstagram] = useState('')
  const [pricePerHour, setPricePerHour] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [videos, setVideos] = useState<File[]>([])

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({ bio: '', location: '', skill: '', instagram: '', price: '' })

  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Derived: what skill name is selected
  const activePredefinedSkill = skills.find((s) => s.id === selectedSkillId)
  const selectedSkillName = confirmedCustomSkill || activePredefinedSkill?.name || null

  const handleSelectSkill = (id: string) => {
    setSelectedSkillId(id)
    setShowCustomInput(false)
    setCustomSkill('')
    setConfirmedCustomSkill('')
    setErrors((e) => ({ ...e, skill: '' }))
  }

  const handleToggleCustom = () => {
    setShowCustomInput(true)
    setSelectedSkillId(null)
    setConfirmedCustomSkill('')
    setCustomSkill('')
    setErrors((e) => ({ ...e, skill: '' }))
  }

  const handleAddCustomSkill = () => {
    const trimmed = customSkill.trim()
    if (!trimmed) return
    setConfirmedCustomSkill(trimmed)
    setCustomSkill('')
    setShowCustomInput(false)
    setErrors((e) => ({ ...e, skill: '' }))
  }

  const handleRemoveCustomSkill = () => {
    setConfirmedCustomSkill('')
    setShowCustomInput(false)
    setCustomSkill('')
  }

  // Photos
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const newFiles = files.slice(0, 10 - photos.length) // max 10 photos
    setPhotos((prev) => [...prev, ...newFiles])
    const previews = newFiles.map((f) => URL.createObjectURL(f))
    setPhotoPreviews((prev) => [...prev, ...previews])
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index])
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // Videos
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const newFiles = files.slice(0, 5 - videos.length) // max 5 videos
    setVideos((prev) => [...prev, ...newFiles])
    e.target.value = ''
  }

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index))
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const validate = () => {
    const e = { bio: '', location: '', skill: '', instagram: '', price: '' }
    if (isFirstTime && bio.trim().length < 20) e.bio = 'Please write at least 20 characters about yourself'
    if (isFirstTime && !location.trim()) e.location = 'Please enter your city or location'
    if (!selectedSkillName) e.skill = 'Please select or enter a skill'
    if (!instagram.trim()) e.instagram = 'Instagram URL is required'
    if (!pricePerHour || Number(pricePerHour) < 100) e.price = 'Enter a valid price (min ₹100)'
    setErrors(e)
    return !e.bio && !e.location && !e.skill && !e.instagram && !e.price
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-5">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-kala-brown mb-3">Application Submitted!</h2>
        <p className="text-stone-500 leading-relaxed mb-2">
          Your application to teach{' '}
          <span className="font-semibold text-kala-brown">{selectedSkillName}</span> is on
          pending review.
        </p>
        <p className="text-stone-400 text-sm mb-6">
          We'll notify you once it's approved. This usually takes 1–2 business days.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-kala-amber bg-amber-50 rounded-xl px-4 py-3">
          <Clock size={16} /> Status: Pending Review
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-kala-brown">Apply as Instructor</h1>
        <p className="text-stone-500 text-sm mt-1">
          Each application is for one skill. Fill in the details below and we'll review your application.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Your Profile — first-time only */}
        {isFirstTime && (
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-1">
              Your Profile
            </h2>
            <p className="text-xs text-stone-400 mb-4">
              The details will be shown to students browsing instructors.
            </p>
            <div className="space-y-4">
              <Textarea
                label="Bio"
                placeholder="Tell students about your creative journey, experience, and teaching style…"
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value)
                  setErrors((er) => ({ ...er, bio: '' }))
                }}
                rows={4}
                error={errors.bio}
                hint={`${bio.trim().length} / 20 characters minimum`}
              />
              <Input
                label="City / Location"
                placeholder="e.g. Mumbai, Maharashtra"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  setErrors((er) => ({ ...er, location: '' }))
                }}
                error={errors.location}
              />
            </div>
          </Card>
        )}

        {/* Skill */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-1">
            Skill
          </h2>
          <p className="text-xs text-stone-400 mb-4">Select the skill you want to teach.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {skills.map((skill) => {
              const isSelected = selectedSkillId === skill.id && !confirmedCustomSkill
              return (
                <button
                  type="button"
                  key={skill.id}
                  onClick={() => handleSelectSkill(skill.id)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-sm font-medium',
                    isSelected
                      ? 'border-kala-amber bg-amber-50 text-kala-brown'
                      : 'border-stone-100 hover:border-stone-200 text-stone-600'
                  )}
                >
                  <span className="text-base">{skillEmojis[skill.slug] || '🎭'}</span>
                  {skill.name}
                </button>
              )
            })}

            {/* Confirmed custom skill tile */}
            {confirmedCustomSkill ? (
              <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-kala-amber bg-amber-50 text-kala-brown text-sm font-medium">
                <span className="text-base">🎭</span>
                <span className="flex-1 truncate">{confirmedCustomSkill}</span>
                <button
                  type="button"
                  onClick={handleRemoveCustomSkill}
                  className="text-stone-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              /* Add your own toggle */
              <button
                type="button"
                onClick={handleToggleCustom}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-sm font-medium',
                  showCustomInput
                    ? 'border-kala-amber bg-amber-50 text-kala-brown'
                    : 'border-dashed border-stone-200 hover:border-kala-amber text-stone-400 hover:text-kala-brown'
                )}
              >
                <Plus size={16} />
                Add your own
              </button>
            )}
          </div>

          {/* Custom skill input + Add button */}
          {showCustomInput && (
            <div className="mt-4 flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="e.g. Warli Painting, Macrame, Block Printing…"
                  value={customSkill}
                  onChange={(e) => {
                    setCustomSkill(e.target.value)
                    setErrors((er) => ({ ...er, skill: '' }))
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSkill() } }}
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomSkill}
                disabled={!customSkill.trim()}
                className="flex-shrink-0 self-start mt-0 px-4 py-2.5 rounded-xl bg-kala-amber text-white text-sm font-medium hover:bg-amber-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add skill
              </button>
            </div>
          )}

          {errors.skill && (
            <p className="text-xs text-red-500 mt-2">{errors.skill}</p>
          )}
        </Card>

        {/* Skill Details */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-4">
            Skill Details
            {selectedSkillName && (
              <span className="ml-2 text-kala-amber normal-case font-normal">
                — {selectedSkillName}
              </span>
            )}
          </h2>

          <div className="space-y-4">
            {/* Instagram */}
            <div className="relative">
              <Input
                label="Instagram URL"
                type="url"
                placeholder="https://instagram.com/yourprofile"
                value={instagram}
                onChange={(e) => {
                  setInstagram(e.target.value)
                  setErrors((er) => ({ ...er, instagram: '' }))
                }}
                error={errors.instagram}
                hint="Share your Instagram profile showcasing this skill"
              />
              <Instagram size={15} className="absolute right-3 top-9 text-stone-400" />
            </div>

            {/* Price */}
            <Input
              label="Session Price per Hour (₹)"
              type="number"
              placeholder="e.g. 799"
              value={pricePerHour}
              onChange={(e) => {
                setPricePerHour(e.target.value)
                setErrors((er) => ({ ...er, price: '' }))
              }}
              error={errors.price}
              hint="Amount students will pay per 1-hour live session"
              min={100}
            />
          </div>
        </Card>

        {/* Photos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Photos</h2>
            <span className="text-xs text-stone-400">{photos.length}/10</span>
          </div>
          <p className="text-xs text-stone-400 mb-4">
            Upload photos of your work for this skill. 
            This will be shown to students browsing instructors. 
            PNG, JPG, WEBP up to 5 MB each.
          </p>

          {/* Previews */}
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
              {photoPreviews.map((src, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-stone-100">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length < 10 && (
            <>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-stone-200 rounded-xl hover:border-kala-amber hover:bg-amber-50/40 transition-colors text-stone-400 hover:text-kala-brown"
              >
                <ImagePlus size={24} />
                <span className="text-sm">Click to add photos</span>
              </button>
            </>
          )}
        </Card>

        {/* Videos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Videos</h2>
            <span className="text-xs text-stone-400">{videos.length}/5</span>
          </div>
          <p className="text-xs text-stone-400 mb-4">
            Upload short demo videos of your skill. This will be shown to students browsing instructors. MP4, MOV up to 50 MB each.
          </p>

          {/* Video list */}
          {videos.length > 0 && (
            <div className="space-y-2 mb-4">
              {videos.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 bg-stone-50 rounded-xl border border-stone-100"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <VideoIcon size={15} className="text-kala-amber" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 truncate">{file.name}</p>
                    <p className="text-xs text-stone-400">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo(i)}
                    className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {videos.length < 5 && (
            <>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={handleVideoChange}
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-stone-200 rounded-xl hover:border-kala-amber hover:bg-amber-50/40 transition-colors text-stone-400 hover:text-kala-brown"
              >
                <VideoIcon size={24} />
                <span className="text-sm">Click to add videos</span>
              </button>
            </>
          )}
        </Card>

        <Button type="submit" loading={loading} size="lg" className="w-full">
          Submit Application
        </Button>
      </form>
    </div>
  )
}
