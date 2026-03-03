import { useState } from 'react'
import { Camera, Instagram, IndianRupee } from 'lucide-react'
import { useInstructorStore } from '../../stores/instructorStore'
import { Input, Textarea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Card } from '../../components/ui/Card'

export function InstructorProfileSettings() {
  const { profile, setProfile } = useInstructorStore()

  const [bio, setBio] = useState(profile?.bio || '')
  const [location, setLocation] = useState(profile?.location || '')
  const [instagramUrl, setInstagramUrl] = useState(profile?.instagramUrl || '')

  // Per-skill pricing: initialise from skillPricing or fall back to the flat pricing
  const [skillPricing, setSkillPricing] = useState<Record<string, string>>(() => {
    if (!profile) return {}
    return Object.fromEntries(
      profile.skills.map((skill) => [
        skill.id,
        String(profile.skillPricing?.[skill.id] ?? profile.pricing),
      ])
    )
  })

  const [saved, setSaved] = useState(false)

  const handleSkillPriceChange = (skillId: string, value: string) => {
    setSkillPricing((prev) => ({ ...prev, [skillId]: value }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (profile) {
      const newSkillPricing = Object.fromEntries(
        Object.entries(skillPricing).map(([k, v]) => [k, Number(v)])
      )
      const prices = Object.values(newSkillPricing).filter((p) => p > 0)
      const fallbackPricing = prices.length > 0 ? Math.min(...prices) : profile.pricing
      setProfile({
        ...profile,
        bio,
        location,
        instagramUrl: instagramUrl.trim() || undefined,
        skillPricing: newSkillPricing,
        pricing: fallbackPricing,
      })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-kala-brown">Profile Settings</h1>

      {/* Avatar */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={profile?.user.name || ''} src={profile?.user.avatarUrl} size="xl" />
            <button
              type="button"
              className="absolute -bottom-1 -right-1 p-1.5 bg-kala-amber rounded-full text-white shadow-md hover:bg-amber-600"
            >
              <Camera size={12} />
            </button>
          </div>
          <Button variant="outline" size="sm">Upload Photo</Button>
        </div>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General info */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-4">Instructor Information</h2>
          <div className="space-y-4">
            <Textarea
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell students about your experience and teaching style"
              required
            />
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
            />

            {/* Instagram URL */}
            <div className="relative">
              <Input
                label="Instagram URL"
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/yourprofile"
                hint="Submitted during your application — update if needed"
              />
              <Instagram size={15} className="absolute right-3 top-9 text-pink-400 pointer-events-none" />
            </div>
          </div>
        </Card>

        {/* Per-skill pricing */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-1">Session Pricing</h2>
          <p className="text-xs text-stone-400 mb-5">Set a price per session for each skill you teach.</p>

          <div className="space-y-3">
            {profile?.skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-4 p-4 rounded-2xl border border-stone-100 bg-stone-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800">{skill.name}</p>
                  {skill.description && (
                    <p className="text-xs text-stone-400 mt-0.5 truncate">{skill.description}</p>
                  )}
                </div>
                <div className="relative flex-shrink-0 w-36">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <IndianRupee size={13} className="text-stone-400" />
                  </span>
                  <input
                    type="number"
                    min={100}
                    value={skillPricing[skill.id] ?? ''}
                    onChange={(e) => handleSkillPriceChange(skill.id, e.target.value)}
                    placeholder="e.g. 799"
                    className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-kala-amber transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Button type="submit">{saved ? '✓ Saved!' : 'Save Changes'}</Button>
      </form>
    </div>
  )
}
