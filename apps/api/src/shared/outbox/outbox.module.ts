import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { QUEUES } from '@/shared/queue/queue.constants';
import { OutboxService } from './outbox.service';
import { OUTBOX_SERVICE } from './repositories/interfaces/outbox.interface';
import { OutboxDispatcherProcessor } from './workers/outbox-dispatcher.processor';
import { OutboxDispatcherScheduler } from './workers/outbox-dispatcher.scheduler';
import { SlotModule } from '@/modules/slot/slot.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => SlotModule),
    BullModule.registerQueue({
      name: QUEUES.OUTBOX,
    }),
    BullModule.registerQueue({
      name: QUEUES.NOTIFICATIONS,
    }),
  ],
  providers: [
    OutboxService,
    {
      provide: OUTBOX_SERVICE,
      useExisting: OutboxService,
    },
    OutboxDispatcherProcessor,
    OutboxDispatcherScheduler,
  ],
  exports: [OUTBOX_SERVICE],
})
export class OutboxModule {}
