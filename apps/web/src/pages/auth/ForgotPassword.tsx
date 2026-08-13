import { useState } from 'react'
import { Link} from 'react-router-dom'
import { Palette, ArrowLeft, Mail } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useForgotPasswordMutation } from '@/features/auth/hooks'
import { ForgotPasswordFields, validateForgotPasswordForm } from '@/features/auth/validation'
import { getApiErrorResponse } from '@/lib/api-error'

export function ForgotPassword() {
  const forgotPasswordMutation = useForgotPasswordMutation()

  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<ForgotPasswordFields, string>>>({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    setErrorMessage('')

    const validationErrors = validateForgotPasswordForm({ email });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await forgotPasswordMutation.mutateAsync({
        email: email.trim().toLowerCase(),
      });
      setIsSubmitted(true);
    } catch (error) {
      setErrorMessage(getApiErrorResponse(error, "Unable to process your request"));
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-kala-cream flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-kala-brown font-bold text-2xl"
            >
              <Palette className="text-kala-amber" size={28} />
              Kala
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-50 rounded-xl mx-auto mb-6">
              <Mail className="text-kala-amber" size={24} />
            </div>

            <h1 className="text-2xl font-bold text-kala-brown mb-2">
              Check your email
            </h1>
            <p className="text-sm text-stone-500 mb-6">
              If an account exists for this email, we sent a password reset
              link.
            </p>

            <Link
              to="/login"
              className="text-sm text-kala-terracotta font-medium hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
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
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage("");
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={errors.email}
            />

            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

            <Button type="submit" loading={loading} className="w-full">
              Send Reset Link
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
