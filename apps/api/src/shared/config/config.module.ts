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
        ACCESS_TOKEN_SECRET: Joi.string().default('ACCESS_TOKEN_SECRET'),
        REFRESH_TOKEN_SECRET: Joi.string().default('REFRESH_TOKEN_SECRET')
      }),
    }),
  ],
})
export class ConfigModule { }
