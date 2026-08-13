import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Palette, Eye, EyeOff, KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '@/features/auth/store'
import { ResetPasswordFields, validateResetPasswordForm } from '@/features/auth/validation'
import { useResetPasswordMutation, useValidateResetTokenMutation, } from '@/features/auth/hooks'
import { getApiErrorResponse } from '@/lib/api-error'
import { Spinner } from '@/components/ui/Spinner'

export function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const token = searchParams.get("token")?.trim() ?? "";

  const { mutate: validateResetToken, isPending: isValidatingResetToken, isError: isResetTokenInvalid, } = useValidateResetTokenMutation()
  const resetPasswordMutation = useResetPasswordMutation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<ResetPasswordFields, string>>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    validateResetToken({ token });
  }, [token, validateResetToken]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage("");

    const validationErrors = validateResetPasswordForm({
      newPassword,
      confirmPassword,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const message = await resetPasswordMutation.mutateAsync({
        token,
        newPassword,
      });

      clearAuth();
      setSuccessMessage(message);
    } catch (error) {
      setErrorMessage(getApiErrorResponse(error, "Unable to reset password"));
    }
  };

  if (!token) {
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
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-xl mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={24} />
            </div>

            <h1 className="text-2xl font-bold text-kala-brown mb-2">
              Invalid reset link
            </h1>
            <p className="text-sm text-stone-500 mb-6">
              This reset link is missing or malformed. Please request a new one.
            </p>

            <Link
              to="/forgot-password"
              className="text-sm text-kala-terracotta font-medium hover:underline"
            >
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isValidatingResetToken) {
    return (
      <div className="min-h-screen bg-kala-cream flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
            <div className="flex justify-center mb-4">
              <Spinner />
            </div>
            <h1 className="text-xl font-bold text-kala-brown mb-2">
              Validating reset link
            </h1>
            <p className="text-sm text-stone-500">
              Please wait while we verify your link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isResetTokenInvalid) {
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
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-xl mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={24} />
            </div>

            <h1 className="text-2xl font-bold text-kala-brown mb-2">
              Link expired or invalid
            </h1>
            <p className="text-sm text-stone-500 mb-6">
              This password reset link is no longer valid. Please request a new
              one.
            </p>

            <Link
              to="/forgot-password"
              className="text-sm text-kala-terracotta font-medium hover:underline"
            >
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (successMessage) {
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
            <div className="flex items-center justify-center w-14 h-14 bg-green-50 rounded-full mx-auto mb-5">
              <CheckCircle2 className="text-green-500" size={28} />
            </div>

            <h1 className="text-2xl font-bold text-kala-brown mb-2">
              Password Reset!
            </h1>
            <p className="text-sm text-stone-500 mb-6">
              {successMessage || "Your password has been reset successfully."}
            </p>

            <Button onClick={() => navigate("/login")} className="w-full">
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-stone-500 text-sm mt-2">
            Choose a strong new password
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <div className="flex items-center justify-center w-12 h-12 bg-amber-50 rounded-xl mb-6">
            <KeyRound className="text-kala-amber" size={24} />
          </div>

          <h1 className="text-2xl font-bold text-kala-brown mb-2">
            Set New Password
          </h1>
          <p className="text-sm text-stone-500 mb-6">
            Use a strong password with uppercase, lowercase, number, and special
            character.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrorMessage("");
                  setErrors((prev) => ({ ...prev, newPassword: "" }));
                }}
                error={errors.newPassword}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-stone-400 hover:text-stone-600"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMessage("");
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                error={errors.confirmPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-stone-400 hover:text-stone-600"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

            <Button
              type="submit"
              loading={resetPasswordMutation.isPending}
              className="w-full"
            >
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}