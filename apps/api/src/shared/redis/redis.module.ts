import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule { }