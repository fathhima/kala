import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Palette, Eye, EyeOff } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useRegisterMutation } from '@/features/auth/hooks'
import type { RegisterDto } from '@/api'
import { type RegisterFields, validateRegisterForm } from '@/utils/validation'
import { getApiErrorResponse } from '@/lib/api-error'

export function Register() {
  const navigate = useNavigate()
  const registerMutation = useRegisterMutation()

  const [formData, setFormData] = useState<RegisterDto>({
    name: '',
    email: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Partial<Record<RegisterFields, string>>>({})
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (field: keyof RegisterDto, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
    setErrorMessage('')
    setErrors((prev) => ({
      ...prev,
      [field]: ''
    }))
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    setErrorMessage('')
    setErrors((prev) => ({
      ...prev,
      confirmPassword: '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage("")
    setErrors({})

    const validationErrors = validateRegisterForm({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirmPassword,
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      const pending = await registerMutation.mutateAsync(formData)

      sessionStorage.setItem("pendingSignupId", pending.pendingSignupId)
      sessionStorage.setItem("pendingSignupMaskedEmail", pending.maskedEmail)
      sessionStorage.setItem(
        "pendingSignupOtpExpiresAt",
        String(Date.now() + pending.expiresIn * 1000)
      )
      sessionStorage.setItem(
        "pendingSignupResendAvailableAt",
        String(Date.now() + pending.resendAfter * 1000)
      )

      navigate("/verify-otp", { replace: true })
    } catch (error) {
      setErrorMessage(getApiErrorResponse(error, "Registration failed"))
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
          <p className="text-stone-500 text-sm mt-2">Start your creative journey today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <h1 className="text-2xl font-bold text-kala-brown mb-2 text-center">Create Account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">

            <Input
              label="Full Name"
              type="text"
              placeholder="Aisha Khan"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
            />
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
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                hint="Use a strong password with letters, numbers and special characters."
                minLength={8}
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                error={errors.confirmPassword}
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}

            <Button type="submit" loading={registerMutation.isPending} className="w-full">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-kala-terracotta font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}