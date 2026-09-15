export const MAILER_PROVIDER = Symbol('MAILER_PROVIDER');
export const MAILER_SERVICE = Symbol('MAILER_SERVICE');

export interface IMailerProvider {
    sendOtpEmail(email: string, otp: string, ttlSeconds: number): Promise<void>;
    sendPasswordResetEmail(email: string, resetLink: string, ttlSeconds: number): Promise<void>;
}

export type IMailerService = IMailerProvider;