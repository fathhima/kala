import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from 'nodemailer'
import { IMailerProvider } from "./interfaces/mailer.interface";

@Injectable()
export class NodemailerMailerRepository implements IMailerProvider {
    private readonly _transporter: nodemailer.Transporter
    private readonly _from: string

    constructor(private readonly _configService: ConfigService) {

        const host = this._configService.getOrThrow<string>('SMTP_HOST')
        const port = this._configService.getOrThrow<number>('SMTP_PORT')
        const user = this._configService.getOrThrow<string>('SMTP_USER')
        const pass = this._configService.getOrThrow<string>('SMTP_PASS')
        this._from = this._configService.getOrThrow<string>('SMTP_FROM')

        this._transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user,
                pass
            }
        })
    }

    async sendOtpEmail(email: string, otp: string, ttlSeconds: number): Promise<void> {
        const expiresInMinutes = Math.ceil(ttlSeconds / 60)

        await this._transporter.sendMail({
            from: this._from,
            to: email,
            subject: 'Verify your email',
            html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Email Verification</h2>
          <p>Your OTP for registration is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>
          This OTP will expire in 
          ${expiresInMinutes} minute${expiresInMinutes > 1 ? 's' : ''}.
        </p>
        </div>
      `,
        })
    }

    async sendPasswordResetEmail(
        email: string,
        resetLink: string,
        ttlSeconds: number,
    ): Promise<void> {
        const expiresInMinutes = Math.ceil(ttlSeconds / 60);

        await this._transporter.sendMail({
            from: this._from,
            to: email,
            subject: "Reset your password",
            html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset</h2>
        <p>We received a request to reset your password.</p>
        <p>
          <a
            href="${resetLink}"
            style="display:inline-block;padding:10px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;"
          >
            Reset Password
          </a>
        </p>
        <p>If the button does not work, use this link:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link expires in ${expiresInMinutes} minute(s).</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
        });
    }

    async sendBookingConfirmedEmail(payload: import("./interfaces/mailer.interface").BookingEmailPayload): Promise<void> {
        const start = new Date(payload.startTime).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: payload.timezone,
        });
        const end = new Date(payload.endTime).toLocaleString('en-US', {
            timeStyle: 'short',
            timeZone: payload.timezone,
        });

        await this._transporter.sendMail({
            from: this._from,
            to: payload.recipientEmail,
            subject: `Booking Confirmed: ${payload.offeringTitle}`,
            html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #059669;">Booking Confirmed! 🎉</h2>
          <p>Hi ${payload.recipientName},</p>
          <p>Your session for <strong>${payload.offeringTitle}</strong> has been successfully booked and confirmed.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Booking Reference:</strong> ${payload.bookingId}</p>
            <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${start} – ${end} (${payload.timezone})</p>
            ${payload.amount ? `<p style="margin: 4px 0;"><strong>Amount Paid:</strong> ${payload.currency ?? 'INR'} ${payload.amount}</p>` : ''}
          </div>
          <p>We look forward to seeing you at your session!</p>
          <p style="color: #6b7280; font-size: 0.9em;">If you need to make any changes, please visit your Kala dashboard.</p>
        </div>
      `,
        });
    }

    async sendBookingCancelledEmail(payload: import("./interfaces/mailer.interface").BookingEmailPayload): Promise<void> {
        const start = new Date(payload.startTime).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: payload.timezone,
        });

        await this._transporter.sendMail({
            from: this._from,
            to: payload.recipientEmail,
            subject: `Booking Cancelled: ${payload.offeringTitle}`,
            html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #dc2626;">Booking Cancelled</h2>
          <p>Hi ${payload.recipientName},</p>
          <p>Your booking for <strong>${payload.offeringTitle}</strong> scheduled for <strong>${start}</strong> has been cancelled.</p>
          ${payload.reason ? `<p><strong>Reason:</strong> ${payload.reason}</p>` : ''}
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Booking Reference:</strong> ${payload.bookingId}</p>
          </div>
          <p>If a refund is applicable according to our policy, it will be processed automatically back to your original payment method.</p>
          <p style="color: #6b7280; font-size: 0.9em;">Thank you for using Kala.</p>
        </div>
      `,
        });
    }
}