import { useEffect, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Palette, ShieldCheck } from 'lucide-react'
import type { VerifyOtpDto } from '@/api'
import { Button } from '@/components/ui/Button'
import { useResendOtpMutation, useVerifyOtpMutation } from '@/features/auth/hooks'
import { validateVerifyOtpForm, type verifyOtpFields } from '@/utils/validation'

type VerifyOtpLocationState = {
  email?: string
}

export function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()

  const verifyOtpMutation = useVerifyOtpMutation()
  const resendOtpMutation = useResendOtpMutation()

  const state = location.state as VerifyOtpLocationState | null
  const email = state?.email ?? ''

  const [formData, setFormData] = useState<VerifyOtpDto>({
    email,
    otp: '',
  })

  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [errors, setErrors] = useState<Partial<Record<verifyOtpFields, string>>>({})
  const [errorMessage, setErrorMessage] = useState('')
  const [resendCooldown, setResendCooldown] = useState(60)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true })
    }
  }, [email, navigate])

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email,
    }))
  }, [email])

  useEffect(() => {
    if (resendCooldown <= 0) return

    const timer = window.setTimeout(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [resendCooldown])

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = digit

    setDigits(nextDigits)
    setFormData((prev) => ({
      ...prev,
      otp: nextDigits.join(''),
    }))
    setErrorMessage('')
    setErrors((prev) => ({
      ...prev,
      otp: '',
    }))

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()

    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const nextDigits = Array(6).fill('')
    pasted.split('').forEach((char, index) => {
      nextDigits[index] = char
    })

    setDigits(nextDigits)
    setFormData((prev) => ({
      ...prev,
      otp: nextDigits.join(''),
    }))
    setErrorMessage('')
    setErrors((prev) => ({
      ...prev,
      otp: '',
    }))

    const focusIndex = Math.min(pasted.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')
    setErrors({})

    const validationErrors = validateVerifyOtpForm({
      otp: formData.otp,
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      await verifyOtpMutation.mutateAsync(formData)
      navigate('/login')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'OTP verification failed')
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return

    setErrorMessage('')
    setErrors({})

    try {
      await resendOtpMutation.mutateAsync({ email })

      setDigits(Array(6).fill(''))
      setFormData((prev) => ({
        ...prev,
        otp: '',
      }))
      setResendCooldown(60)
      inputRefs.current[0]?.focus()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to resend OTP')
    }
  }

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, start, middle, end) => {
      return `${start}${'*'.repeat(middle.length)}${end}`
    })
    : ''

  const subtitle = 'Verify your email to complete sign up'

  return (
    <div className="min-h-screen bg-kala-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-kala-brown font-bold text-2xl">
            <Palette className="text-kala-amber" size={28} />
            Kala
          </Link>
          <p className="text-stone-500 text-sm mt-2">{subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <div className="flex items-center justify-center w-12 h-12 bg-amber-50 rounded-xl mb-6">
            <ShieldCheck className="text-kala-amber" size={24} />
          </div>

          <h1 className="text-2xl font-bold text-kala-brown mb-2">Enter Verification Code</h1>
          <p className="text-sm text-stone-500 mb-6">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-stone-700">{maskedEmail}</span>.
            It expires in 10 minutes.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-between mb-4">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={[
                    'w-11 h-12 text-center text-lg font-semibold rounded-xl border outline-none transition-all',
                    'focus:ring-2 focus:ring-kala-amber focus:border-kala-amber',
                    digit
                      ? 'border-kala-amber bg-amber-50 text-kala-brown'
                      : 'border-stone-200 bg-white text-stone-800',
                    errors.otp ? 'border-red-400 bg-red-50' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  autoComplete="one-time-code"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {errors.otp && (
              <p className="text-xs text-red-500 mb-3">{errors.otp}</p>
            )}

            {errorMessage && (
              <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
            )}

            <Button type="submit" loading={verifyOtpMutation.isPending} className="w-full">
              Verify & Create Account
            </Button>
          </form>

          <div className="text-center mt-4 text-sm text-stone-500">
            Didn&apos;t receive a code?{' '}
            {resendCooldown > 0 ? (
              <span className="text-stone-400">Resend in {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendOtpMutation.isPending}
                className="text-kala-terracotta font-medium hover:underline disabled:opacity-50"
              >
                {resendOtpMutation.isPending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}