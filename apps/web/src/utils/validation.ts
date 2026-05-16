export type ValidationErrors<T extends string> = Partial<Record<T, string>>

export const isValidName = (value: string) => {
    return /^(?=.*\p{L})[\p{L}\s'-]{2,}$/u.test(value.trim())
}

export const isEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export const isStrongPassword = (value: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)
}

export const isValidOtp = (value: string) => {
    return /^\d{6}$/.test(value)
}

export type RegisterFields = 'name' | 'email' | 'password' | 'confirmPassword'
export type Loginfields = 'email' | 'password'
export type verifyOtpFields = 'otp'

export const validateRegisterForm = (data: {
    name: string,
    email: string,
    password: string,
    confirmPassword: string
}): ValidationErrors<RegisterFields> => {
    const errors: ValidationErrors<RegisterFields> = {}

    if (!data.name.trim()) {
        errors.name = 'Name is required'
    } else if (!isValidName(data.name)) {
        errors.name = 'Enter a valid name'
    }

    if (!data.email.trim()) {
        errors.email = 'Email is required'
    } else if (!isEmail(data.email)) {
        errors.email = 'Enter a valid email address'
    }

    if (!data.password) {
        errors.password = 'Password is required'
    } else if (!isStrongPassword(data.password)) {
        errors.password = 'Enter a valid password'
    }

    if (!data.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password'
    } else if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
    }

    return errors
}

export const validateLoginForm = (data: {
    email: string,
    password: string
}): ValidationErrors<Loginfields> => {
    const errors: ValidationErrors<Loginfields> = {}

    if (!data.email.trim()) {
        errors.email = 'Email is required'
    } else if (!isEmail(data.email)) {
        errors.email = 'Enter a valid email address'
    }

    if (!data.password) {
        errors.password = 'Password is required'
    }

    return errors
}

export const validateVerifyOtpForm = (data: {
    otp: string
}): ValidationErrors<verifyOtpFields> => {
    const errors: ValidationErrors<verifyOtpFields> = {}

    if (!data.otp.trim()) {
        errors.otp = 'OTP is required'
    } else if (!isValidOtp(data.otp)) {
        errors.otp = 'OTP must be 6 digits'
    }

    return errors
}