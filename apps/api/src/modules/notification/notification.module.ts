import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@/shared/queue/queue.constants';
import { MailerModule } from '@/shared/mailer/mailer.module';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { NotificationProcessor } from './workers/notification.processor';

@Module({
  imports: [
    PrismaModule,
    MailerModule,
    BullModule.registerQueue({
      name: QUEUES.NOTIFICATIONS,
    }),
  ],
  providers: [
    NotificationProcessor,
  ],
  exports: [
    BullModule,
  ],
})
export class NotificationModule {}
