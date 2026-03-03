import { useState } from 'react'
import { Camera, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Card } from '../../components/ui/Card'

export function StudentProfileSettings() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (user) setUser({ ...user, name })
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
            <Avatar name={user?.name || ''} src={user?.avatarUrl} size="xl" />
            <button className="absolute -bottom-1 -right-1 p-1.5 bg-kala-amber rounded-full text-white shadow-md hover:bg-amber-600 transition-colors">
              <Camera size={12} />
            </button>
          </div>
          <div>
            <p className="font-medium text-stone-700 text-sm">{user?.name}</p>
            <p className="text-xs text-stone-400 mt-0.5">Click the camera icon to upload a new photo</p>
            <Button variant="outline" size="sm" className="mt-2">Upload Photo</Button>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-4">Personal Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Email — read-only display */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Email Address
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 text-sm select-none">
              <span className="flex-1">{user?.email}</span>
              {/* <span className="text-xs text-stone-400 bg-stone-200 rounded-md px-1.5 py-0.5">
                Cannot be changed
              </span> */}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button type="submit">
              {saved ? '✓ Saved!' : 'Save Changes'}
            </Button>

            <button
              type="button"
              onClick={() => navigate('/dashboard/change-password')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700"
            >
              <Lock size={15} className="text-stone-400" />
              Change Password
            </button>
          </div>
        </form>
        {/* Password */}
        {/* <Card className="p-6">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-1">Password</h2> */}
        {/* <p className="text-sm text-stone-400 mb-4">Update your password to keep your account secure.</p> */}

        {/* </Card> */}
      </Card>


    </div>
  )
}
