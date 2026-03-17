import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
    imports:[ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      validationSchema: Joi.object({
        REDIS_URI: Joi.string().uri().default('redis://127.0.0.1:6379')
      }),
    }),],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
