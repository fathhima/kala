import { Global, Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
      ConfigModule.forRoot({
        envFilePath: '.env',
        cache: true,
        validationSchema: Joi.object({
          SMTP_HOST: Joi.string().allow('').optional(),
          SMTP_PORT: Joi.number().integer().positive().default(587),
          SMTP_USER: Joi.string().allow('').optional(),
          SMTP_PASS: Joi.string().allow('').optional(),
          SMTP_FROM: Joi.string().email().default('no-reply@kala.local'),
        }),
      }),
    ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
