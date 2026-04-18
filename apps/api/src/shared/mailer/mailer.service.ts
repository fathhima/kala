import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter
  private readonly from: string

  constructor(private readonly configService: ConfigService) {

    const host = this.configService.getOrThrow<string>('SMTP_HOST')
    const port = this.configService.getOrThrow<number>('SMTP_PORT')
    const user = this.configService.getOrThrow<string>('SMTP_USER')
    const pass = this.configService.getOrThrow<string>('SMTP_PASS')
    this.from = this.configService.getOrThrow<string>('SMTP_FROM')

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass
      }
    })
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: 'Verify your email',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Email Verification</h2>
          <p>Your OTP for registration is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This OTP will expire in 1 minutes.</p>
        </div>
      `,
    })
  }
}