import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Palette, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const verified: boolean = (location.state as { verified?: boolean })?.verified ?? false

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' })

  // Redirect back if OTP was not verified
  useEffect(() => {
    if (!verified) navigate('/forgot-password', { replace: true })
  }, [verified, navigate])

  const validate = () => {
    const next = { password: '', confirmPassword: '' }
    if (password.length < 8) next.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return !next.password && !next.confirmPassword
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    // Mock: simulate API call
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-kala-cream flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-kala-brown font-bold text-2xl">
              <Palette className="text-kala-amber" size={28} />
              Kala
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
            <div className="flex items-center justify-center w-14 h-14 bg-green-50 rounded-full mx-auto mb-5">
              <CheckCircle2 className="text-green-500" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-kala-brown mb-2">Password Reset!</h1>
            <p className="text-sm text-stone-500 mb-6">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-kala-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-kala-brown font-bold text-2xl">
            <Palette className="text-kala-amber" size={28} />
            Kala
          </Link>
          <p className="text-stone-500 text-sm mt-2">Choose a strong new password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 bg-amber-50 rounded-xl mb-6">
            <KeyRound className="text-kala-amber" size={24} />
          </div>

          <h1 className="text-2xl font-bold text-kala-brown mb-2">Set New Password</h1>
          <p className="text-sm text-stone-500 mb-6">
            Your new password must be at least 8 characters long.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-9 text-stone-400 hover:text-stone-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Reset Password
            </Button>
          </form>

          {/* <p className="text-center text-sm text-stone-500 mt-6">
            Remembered it?{' '}
            <Link to="/login" className="text-kala-terracotta font-medium hover:underline">
              Sign in
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  )
}
