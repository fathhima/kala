
export type PendingSignup = {
    id: string,
    name: string,
    email: string,
    hashedPassword: string,
    otpHash: string,
    otpAttempts: number,
    resendCount: number,
    createdAt: string,
    otpExpiresAt: string,
    resendAfter: string
}