import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOBS, QUEUES } from '@/shared/queue/queue.constants';
import { LOGGER_SERVICE, type ILoggerService } from '@/shared/logger/repositories/interfaces/logger.interface';

@Injectable()
export class OutboxDispatcherScheduler implements OnModuleInit {
  constructor(
    @InjectQueue(QUEUES.OUTBOX)
    private readonly _outboxQueue: Queue,
    @Inject(LOGGER_SERVICE)
    private readonly _logger: ILoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this._outboxQueue.upsertJobScheduler(
        'outbox-dispatcher-scheduler',
        {
          every: 3_000, // Flush outbox every 3 seconds
        },
        {
          name: JOBS.DISPATCH_OUTBOX,
          data: {},
          opts: {
            removeOnComplete: 100,
            removeOnFail: 500,
          },
        },
      );
      this._logger.log(
        'Outbox dispatcher repeatable BullMQ job registered (every 3s)',
        OutboxDispatcherScheduler.name,
      );
    } catch (error) {
      this._logger.error(
        `Failed to register outbox dispatcher repeatable job: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
        OutboxDispatcherScheduler.name,
      );
    }
  }
}
