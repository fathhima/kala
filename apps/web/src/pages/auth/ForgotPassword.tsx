import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Palette, ArrowLeft, Mail } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Mock: simulate sending OTP email
    await new Promise((r) => setTimeout(r, 800))

    setLoading(false)
    navigate('/verify-otp', { state: { email } })
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
          <p className="text-stone-500 text-sm mt-2">We'll send a code to your email</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 bg-amber-50 rounded-xl mb-6">
            <Mail className="text-kala-amber" size={24} />
          </div>

          <h1 className="text-2xl font-bold text-kala-brown mb-2">Forgot Password?</h1>
          <p className="text-sm text-stone-500 mb-6">
            Enter your registered email address and we'll send you a one-time code to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              required
            />

            <Button type="submit" loading={loading} className="w-full">
              Send Reset Code
            </Button>
          </form>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 mt-6 text-sm text-stone-500 hover:text-kala-brown transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
