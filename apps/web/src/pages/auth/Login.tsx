import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Palette, Eye, EyeOff } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useLoginMutation, useMeQuery } from '@/features/auth/hooks'
import { useAuthStore } from '@/features/auth/store'
import type { LoginDto } from '@/api'
import { type Loginfields, validateLoginForm } from '@/utils/validation'
import { getMe } from '@/features/auth/api'

export function Login() {
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()
  const setUser = useAuthStore((state) => state.setUser)

  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<Loginfields, string>>>({})
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (field: keyof LoginDto, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setErrorMessage('')
    setErrors((prev) => ({
      ...prev,
      [field]: ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')
    setErrors({})

    const validationErrors = validateLoginForm({
      email: formData.email,
      password: formData.password,
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      await loginMutation.mutateAsync(formData)
      const user = await getMe()
      setUser(user)
      navigate('/dashboard')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login failed')
    }
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
          <p className="text-stone-500 text-sm mt-2">Welcome back, creative soul</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <h1 className="text-2xl font-bold text-kala-brown mb-6 text-center">Sign In</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-1">
              <Link
                to="/forgot-password"
                className="text-xs text-kala-terracotta hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loginMutation.isPending} className="w-full">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            New to Kala?{' '}
            <Link to="/register" className="text-kala-terracotta font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}