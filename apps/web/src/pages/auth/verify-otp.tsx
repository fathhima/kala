import { useEffect, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Palette, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useResendOtpMutation, useVerifyOtpMutation } from '@/features/auth/hooks'
import { validateVerifyOtpForm, type verifyOtpFields } from '@/utils/validation'
import { useAuthStore } from '@/features/auth/store'
import { getApiErrorResponse } from '@/lib/api-error'

const PENDING_SIGNUP_ID_KEY = 'pendingSignupId'
const PENDING_SIGNUP_MASKED_EMAIL_KEY = 'pendingSignupMaskedEmail'
const PENDING_SIGNUP_EXPIRES_AT_KEY = 'pendingSignupOtpExpiresAt'

const getInitialCooldown = () => {
  const stored = sessionStorage.getItem(PENDING_SIGNUP_EXPIRES_AT_KEY)
  if (!stored) return 0

  const remaining = Math.ceil((Number(stored) - Date.now()) / 1000)
  return remaining > 0 ? remaining : 0
}

export function VerifyOtp() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const verifyOtpMutation = useVerifyOtpMutation()
  const resendOtpMutation = useResendOtpMutation()

  const [pendingSignupId] = useState(() => sessionStorage.getItem(PENDING_SIGNUP_ID_KEY) ?? '')
  const [maskedEmail] = useState(() => sessionStorage.getItem(PENDING_SIGNUP_MASKED_EMAIL_KEY) ?? '')

  const [otp, setOtp] = useState('')
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [errors, setErrors] = useState<Partial<Record<verifyOtpFields, string>>>({})
  const [errorMessage, setErrorMessage] = useState('')
  const [resendCooldown, setResendCooldown] = useState<number>(getInitialCooldown)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [isCompletingAuth, setIsCompletingAuth] = useState(false)

  const expiresInMinutes = Math.ceil(resendCooldown / 60)

  useEffect(() => {
    if (!pendingSignupId && !isCompletingAuth) {
      navigate('/register', { replace: true })
    }
  }, [pendingSignupId, isCompletingAuth, navigate])

  useEffect(() => {
    if (resendCooldown <= 0) {
      sessionStorage.removeItem(PENDING_SIGNUP_EXPIRES_AT_KEY)
      return
    }

    const timer = window.setTimeout(() => {
      const stored = sessionStorage.getItem(PENDING_SIGNUP_EXPIRES_AT_KEY)

      if (!stored) {
        setResendCooldown(0)
        return
      }

      const remaining = Math.ceil((Number(stored) - Date.now()) / 1000)
      setResendCooldown(remaining > 0 ? remaining : 0)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [resendCooldown])

  const clearPendingSignupSession = () => {
    sessionStorage.removeItem(PENDING_SIGNUP_ID_KEY)
    sessionStorage.removeItem(PENDING_SIGNUP_MASKED_EMAIL_KEY)
    sessionStorage.removeItem(PENDING_SIGNUP_EXPIRES_AT_KEY)
  }

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = digit

    setDigits(nextDigits)
    setOtp(nextDigits.join(''))
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
    setOtp(nextDigits.join(''))
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

    const validationErrors = validateVerifyOtpForm({ otp })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (!pendingSignupId) {
      setErrorMessage('Registration session expired. Please register again.')
      navigate('/register', { replace: true })
      return
    }

    try {
      const authData = await verifyOtpMutation.mutateAsync({
        pendingSignupId,
        otp,
      })

      setIsCompletingAuth(true)
      setAuth(authData.user, authData.accessToken)
      navigate('/', { replace: true })
      clearPendingSignupSession()
    } catch (error) {
      setErrorMessage(getApiErrorResponse(error, 'OTP verification failed'))
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !pendingSignupId) return

    setErrorMessage('')
    setErrors({})

    try {
      const response = await resendOtpMutation.mutateAsync({ pendingSignupId })

      const expiresAt = Date.now() + response.expiresIn * 1000
      setResendCooldown(response.expiresIn)
      sessionStorage.setItem(PENDING_SIGNUP_EXPIRES_AT_KEY, String(expiresAt))

      setDigits(Array(6).fill(''))
      setOtp('')
      setResendCooldown(60)
      inputRefs.current[0]?.focus()
    } catch (error) {
      setErrorMessage(getApiErrorResponse(error, 'Failed to resend OTP'))
    }
  }

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
            <span className="font-medium text-stone-700">{maskedEmail || 'your email'}</span>.
            It expires in {expiresInMinutes} minute{expiresInMinutes > 1 ? 's' : ''}.
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