import { z } from 'zod'

export type ValidationErrors<T extends string> = Partial<Record<T, string>>

const nameRegex = /^(?=.*\p{L})[\p{L}\s'-]{2,}$/u
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const otpRegex = /^\d{6}$/

export const isValidName = (value: string) => nameRegex.test(value.trim())
export const isEmail = (value: string) => emailRegex.test(value)
export const isStrongPassword = (value: string) => strongPasswordRegex.test(value)
export const isValidOtp = (value: string) => otpRegex.test(value)

export type RegisterFields = 'name' | 'email' | 'password' | 'confirmPassword'
export type Loginfields = 'email' | 'password'
export type verifyOtpFields = 'otp'
export type ForgotPasswordFields = 'email'
export type ResetPasswordFields = 'newPassword' | 'confirmPassword'

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .refine(isValidName, 'Enter a valid name'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .refine(isEmail, 'Enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .refine(isStrongPassword, 'Enter a valid password'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .refine(isEmail, 'Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .min(1, 'OTP is required')
    .refine(isValidOtp, 'OTP must be 6 digits'),
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .refine(isEmail, 'Enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .refine(isStrongPassword, 'Enter a valid password'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

const getValidationErrors = <T extends string>(
  result: ReturnType<typeof registerSchema.safeParse>
): ValidationErrors<T> => {
  if (result.success) {
    return {}
  }

  const errors: ValidationErrors<T> = {}

  for (const issue of result.error.issues) {
    const field = issue.path[0]

    if (typeof field !== 'string') {
      continue
    }

    if (!errors[field as T]) {
      errors[field as T] = issue.message
    }
  }

  return errors
}

export const validateRegisterForm = (data: {
  name: string
  email: string
  password: string
  confirmPassword: string
}): ValidationErrors<RegisterFields> => {
  return getValidationErrors<RegisterFields>(registerSchema.safeParse(data))
}

export const validateLoginForm = (data: {
  email: string
  password: string
}): ValidationErrors<Loginfields> => {
  return getValidationErrors<Loginfields>(loginSchema.safeParse(data))
}

export const validateVerifyOtpForm = (data: {
  otp: string
}): ValidationErrors<verifyOtpFields> => {
  return getValidationErrors<verifyOtpFields>(verifyOtpSchema.safeParse(data))
}

export const validateForgotPasswordForm = (data: {
  email: string
}): ValidationErrors<ForgotPasswordFields> => {
  return getValidationErrors<ForgotPasswordFields>(
    forgotPasswordSchema.safeParse(data)
  )
}

export const validateResetPasswordForm = (data: {
  newPassword: string
  confirmPassword: string
}): ValidationErrors<ResetPasswordFields> => {
  return getValidationErrors<ResetPasswordFields>(
    resetPasswordSchema.safeParse(data)
  )
}