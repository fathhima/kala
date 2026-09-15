import { Inject, Injectable } from "@nestjs/common";
import { MAILER_PROVIDER, type IMailerProvider, IMailerService } from "./repositories/interfaces/mailer.interface";

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
}
