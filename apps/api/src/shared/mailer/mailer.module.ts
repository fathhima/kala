import { Global, Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MAILER_PROVIDER, MAILER_SERVICE } from './repositories/interfaces/mailer.interface';
import { NodemailerMailerRepository } from './repositories/nodemailer-mailer.repository';

@Global()
@Module({
  providers: [
    {
      provide: MAILER_SERVICE,
      useClass: MailerService,
    },
    NodemailerMailerRepository,
    {
      provide: MAILER_PROVIDER,
      useExisting: NodemailerMailerRepository,
    },
  ],
  exports: [MAILER_SERVICE],
})
export class MailerModule { }
