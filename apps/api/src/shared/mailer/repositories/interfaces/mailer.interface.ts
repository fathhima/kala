export const MAILER_PROVIDER = Symbol('MAILER_PROVIDER');
export const MAILER_SERVICE = Symbol('MAILER_SERVICE');

export interface BookingEmailPayload {
    recipientEmail: string;
    recipientName: string;
    bookingId: string;
    offeringTitle: string;
    startTime: Date;
    endTime: Date;
    timezone: string;
    amount?: number | string;
    currency?: string;
    reason?: string;
    isInstructor?: boolean;
}

export interface IMailerProvider {
    sendOtpEmail(email: string, otp: string, ttlSeconds: number): Promise<void>;
    sendPasswordResetEmail(email: string, resetLink: string, ttlSeconds: number): Promise<void>;
    sendBookingConfirmedEmail(payload: BookingEmailPayload): Promise<void>;
    sendBookingCancelledEmail(payload: BookingEmailPayload): Promise<void>;
}

export type IMailerService = IMailerProvider;