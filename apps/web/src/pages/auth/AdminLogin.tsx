import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Palette, Eye, EyeOff } from 'lucide-react'
import type { LoginDto } from '@/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useLoginMutation, useLogoutMutation } from '@/features/auth/hooks'
import { useAuthStore } from '@/features/auth/store'
import { getApiErrorResponse } from '@/lib/api-error'
import { type Loginfields, validateLoginForm } from '@/features/auth/validation'

export function AdminLogin() {
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()
  const logoutMutation = useLogoutMutation()
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
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
      [field]: '',
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
      const authData = await loginMutation.mutateAsync(formData)

      if (!authData.user.roles.includes('ADMIN')) {
        try {
          await logoutMutation.mutateAsync()
        } catch {
        } finally {
          clearAuth()
        }

        setErrorMessage('This account does not have admin access')
        return
      }

      setAuth(authData.user, authData.accessToken)
      navigate('/admin', { replace: true })
    } catch (error) {
      clearAuth()
      setErrorMessage(getApiErrorResponse(error, 'Admin login failed'))
    }
  }

  return (
    <div className="min-h-screen bg-kala-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-kala-brown font-bold text-2xl">
            <Palette className="text-kala-amber" size={28} />
            Kala
          </Link>
          <p className="text-stone-500 text-sm mt-2">Admin access only</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <h1 className="text-2xl font-bold text-kala-brown mb-6 text-center">Admin Sign In</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="........"
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

            {errorMessage ? (
              <p className="text-sm text-red-500">{errorMessage}</p>
            ) : null}

            <Button type="submit" loading={loginMutation.isPending} className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}