import { Global, Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule { }