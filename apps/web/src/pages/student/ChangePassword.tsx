import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function ChangePassword() {
  const navigate = useNavigate()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [errors, setErrors] = useState({ current: '', next: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e = { current: '', next: '', confirm: '' }
    if (!current) e.current = 'Enter your current password'
    if (next.length < 8) e.next = 'New password must be at least 8 characters'
    if (next !== confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return !e.current && !e.next && !e.confirm
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    // Mock API call
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="max-w-lg">
        <Card className="p-8 text-center">
          <div className="flex items-center justify-center w-14 h-14 bg-green-50 rounded-full mx-auto mb-5">
            <CheckCircle2 className="text-green-500" size={28} />
          </div>
          <h2 className="text-xl font-bold text-kala-brown mb-2">Password Updated</h2>
          <p className="text-sm text-stone-500 mb-6">
            Your password has been changed successfully.
          </p>
          <Button onClick={() => navigate('/dashboard/settings')} className="w-full">
            Back to Settings
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard/settings')}
          className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-500"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-kala-brown">Change Password</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current password */}
          <div className="relative">
            <Input
              label="Current Password"
              type={showCurrent ? 'text' : 'password'}
              placeholder="Enter your current password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              error={errors.current}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-9 text-stone-400 hover:text-stone-600"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="border-t border-stone-100 pt-4 space-y-4">
            {/* New password */}
            <div className="relative">
              <Input
                label="New Password"
                type={showNext ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                error={errors.next}
              />
              <button
                type="button"
                onClick={() => setShowNext(!showNext)}
                className="absolute right-3 top-9 text-stone-400 hover:text-stone-600"
              >
                {showNext ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm password */}
            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={errors.confirm}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-9 text-stone-400 hover:text-stone-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={loading}>
              Update Password
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/dashboard/settings')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
