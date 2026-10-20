import { Inject, Injectable } from "@nestjs/common";
import { BookingEmailPayload, MAILER_PROVIDER, type IMailerProvider, IMailerService } from "./repositories/interfaces/mailer.interface";

@Injectable()
export class MailerService implements IMailerService {
  constructor(
    @Inject(MAILER_PROVIDER)
    private readonly _mailerProvider: IMailerProvider,
  ) { }

  sendOtpEmail(email: string, otp: string, ttlSeconds: number): Promise<void> {
    return this._mailerProvider.sendOtpEmail(email, otp, ttlSeconds);
  }

  sendPasswordResetEmail(email: string, resetLink: string, ttlSeconds: number): Promise<void> {
    return this._mailerProvider.sendPasswordResetEmail(email, resetLink, ttlSeconds);
  }

  sendBookingConfirmedEmail(payload: BookingEmailPayload): Promise<void> {
    return this._mailerProvider.sendBookingConfirmedEmail(payload);
  }

  sendBookingCancelledEmail(payload: BookingEmailPayload): Promise<void> {
    return this._mailerProvider.sendBookingCancelledEmail(payload);
  }
}

