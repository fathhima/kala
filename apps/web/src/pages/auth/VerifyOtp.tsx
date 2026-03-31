import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Palette, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { AuthService } from '@/services/auth.service'

const OTP_LENGTH = 6

type LocationState = {
  email?: string
  purpose?: 'registration' | 'password-reset'
  name?: string
}

export function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()

  const state = (location.state as LocationState) ?? {}
  const email = state.email ?? ''
  const purpose = state.purpose ?? 'password-reset'
  const pendingName = state.name ?? ''

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null))

  const fallbackRoute = purpose === 'registration' ? '/register' : '/forgot-password'

  // Redirect back if no email in state
  useEffect(() => {
    if (!email) navigate(fallbackRoute, { replace: true })
  }, [email, navigate, fallbackRoute])

  // Countdown for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Start cooldown immediately for forgot-password flow after code is sent.
  useEffect(() => {
    if (purpose === 'password-reset' && email) {
      setResendCooldown(60)
    }
  }, [purpose, email])

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError('')

    if (digit && index < OTP_LENGTH - 1) {
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
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = [...digits]
    pasted.split('').forEach((char, i) => { next[i] = char })
    setDigits(next)
    setError('')
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits')
      return
    }
    setError('')
    setLoading(true)

    if (purpose === 'registration') {
      const { error: verifyError } = await AuthService.verifyOtp(email, code)

      if (verifyError) {
        setError(
          Array.isArray(verifyError.message)
            ? verifyError.message.join(', ')
            : verifyError.message || 'Verification failed'
        )
        setLoading(false)
        return
      }

      setLoading(false)
      navigate('/login', { replace: true })
      return
    }

    setLoading(false)
    navigate('/reset-password', {
      state: {
        email,
        otp: code,
        verified: true,
      },
      replace: true,
    })
  }

  const handleResend = async () => {
    setError('')
    setResendLoading(true)

    const { error: resendError } = purpose === 'registration'
      ? await AuthService.resendOtp(email)
      : await AuthService.forgotPassword(email)

    setResendLoading(false)

    if (resendError) {
      setError(
        Array.isArray(resendError.message)
          ? resendError.message.join(', ')
          : resendError.message || 'Unable to resend OTP'
      )
      return
    }

    setResendCooldown(60)
    setDigits(Array(OTP_LENGTH).fill(''))
    setError('')
    inputRefs.current[0]?.focus()
  }

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
    : ''

  const subtitle = purpose === 'registration'
    ? 'Verify your email to complete sign up'
    : 'Check your email for a reset code'

  // const backLabel = purpose === 'registration'
  // ? 'Use a different email'
  //   : 'Use a different email'

  return (
    <div className="min-h-screen bg-kala-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-kala-brown font-bold text-2xl">
            <Palette className="text-kala-amber" size={28} />
            Kala
          </Link>
          <p className="text-stone-500 text-sm mt-2">{subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          {/* Icon */}
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
            {/* OTP boxes */}
            <div className="flex gap-2 justify-between mb-4">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className={[
                    'w-11 h-12 text-center text-lg font-semibold rounded-xl border outline-none transition-all',
                    'focus:ring-2 focus:ring-kala-amber focus:border-kala-amber',
                    digit ? 'border-kala-amber bg-amber-50 text-kala-brown' : 'border-stone-200 bg-white text-stone-800',
                    error ? 'border-red-400 bg-red-50' : '',
                  ].filter(Boolean).join(' ')}
                  autoComplete="one-time-code"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-500 mb-4">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {purpose === 'registration' ? 'Verify & Create Account' : 'Continue'}
            </Button>
          </form>

          {/* Resend */}
          <div className="text-center mt-4 text-sm text-stone-500">
            Didn't receive a code?{' '}
            {resendCooldown > 0 ? (
              <span className="text-stone-400">Resend in {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-kala-terracotta font-medium hover:underline disabled:opacity-50"
              >
                {resendLoading ? 'Sending…' : 'Resend code'}
              </button>
            )}
          </div>

          {/* <Link
            to={fallbackRoute}
            className="flex items-center justify-center gap-1.5 mt-5 text-sm text-stone-500 hover:text-kala-brown transition-colors"
          >
            <ArrowLeft size={14} />
            {backLabel}
          </Link> */}
        </div>
      </div>
    </div>
  )
}
