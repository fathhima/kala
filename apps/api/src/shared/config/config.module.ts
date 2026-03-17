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
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(4000),
        CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
        OTP_TTL_SECONDS: Joi.number().integer().min(60).default(600),
        ACCESS_TOKEN_SECRET: Joi.string().default('ACCESS_SECRET'),
        REFRESH_TOKEN_SECRET: Joi.string().default('REFRESH_SECRET')
      }),
    }),
  ],
})
export class ConfigModule {}
