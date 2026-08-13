import { z } from 'zod'
import { getValidationErrors, type ValidationErrors } from '@/utils/validation'

const emailSchema = z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address')

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or less')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/\d/, 'Password must include a number')
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character')

export type Loginfields = 'email' | 'password'
export type RegisterFields = 'name' | 'email' | 'password' | 'confirmPassword'
export type ForgotPasswordFields = 'email'
export type ResetPasswordFields = 'newPassword' | 'confirmPassword'
export type verifyOtpFields = 'otp'

const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
})

const registerSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name must be 100 characters or less'),
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match',
    })

const forgotPasswordSchema = z.object({
    email: emailSchema,
})

const resetPasswordSchema = z
    .object({
        newPassword: passwordSchema,
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match',
    })

const verifyOtpSchema = z.object({
    otp: z
        .string()
        .regex(/^\d{6}$/, 'Enter the complete 6-digit verification code'),
})

export const validateLoginForm = (data: { email: string; password: string },): ValidationErrors<Loginfields> =>
    getValidationErrors<Loginfields>(loginSchema.safeParse(data))

export const validateRegisterForm = (
    data: {
        name: string
        email: string
        password: string
        confirmPassword: string
    },
): ValidationErrors<RegisterFields> =>
    getValidationErrors<RegisterFields>(registerSchema.safeParse(data))

export const validateForgotPasswordForm = (data: { email: string },): ValidationErrors<ForgotPasswordFields> =>
    getValidationErrors<ForgotPasswordFields>(
        forgotPasswordSchema.safeParse(data),
    )

export const validateResetPasswordForm = (data: { newPassword: string; confirmPassword: string },
): ValidationErrors<ResetPasswordFields> =>
    getValidationErrors<ResetPasswordFields>(
        resetPasswordSchema.safeParse(data),
    )

export const validateVerifyOtpForm = (data: { otp: string },): ValidationErrors<verifyOtpFields> =>
    getValidationErrors<verifyOtpFields>(verifyOtpSchema.safeParse(data))