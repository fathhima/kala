import Joi from 'joi';
import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(4000),
        CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
        REDIS_URI: Joi.string().default('redis://localhost:6379'),
        SMTP_HOST: Joi.string().allow('').optional(),
        SMTP_PORT: Joi.number().integer().positive().default(587),
        SMTP_USER: Joi.string().allow('').optional(),
        SMTP_PASS: Joi.string().allow('').optional(),
        SMTP_FROM: Joi.string().email().default('no-reply@kala.local'),
        OTP_TTL_SECONDS: Joi.number().integer().min(60).default(60),
        OTP_RESEND_COOLDOWN_SECONDS: Joi.number().integer().min(10).default(60),
        ACCESS_TOKEN_SECRET: Joi.string().min(32).required(),
        REFRESH_TOKEN_SECRET: Joi.string().min(32).required(),
        ACCESS_TOKEN_EXPIRES_IN: Joi.string().default("15m"),
        REFRESH_TOKEN_EXPIRES_IN: Joi.string().default("7d"),
        REFRESH_COOKIE_NAME: Joi.string().default("refreshToken"),
        COOKIE_SECURE: Joi.boolean().default(false),
        COOKIE_SAME_SITE: Joi.string()
          .valid("lax", "strict", "none")
          .default("lax"),
        COOKIE_DOMAIN: Joi.string().allow("").optional(),
        PASSWORD_RESET_TTL_SECONDS: Joi.number().integer().min(300).default(900),
        PASSWORD_RESET_URL: Joi.string().uri().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
      }),
    }),
  ],
})
export class ConfigModule { }
