import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOBS, QUEUES } from '@/shared/queue/queue.constants';
import { LOGGER_SERVICE, type ILoggerService } from '@/shared/logger/repositories/interfaces/logger.interface';

@Injectable()
export class HoldExpiryScheduler implements OnModuleInit {
  constructor(
    @InjectQueue(QUEUES.HOLD_EXPIRY)
    private readonly _holdExpiryQueue: Queue,
    @Inject(LOGGER_SERVICE)
    private readonly _logger: ILoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      // Upsert a repeatable job scheduler in BullMQ (every 15 seconds)
      await this._holdExpiryQueue.upsertJobScheduler(
        'hold-expiry-scheduler',
        {
          every: 15_000,
        },
        {
          name: JOBS.EXPIRE_HOLDS,
          data: {},
          opts: {
            removeOnComplete: 100,
            removeOnFail: 500,
          },
        },
      );
      this._logger.log(
        'Hold-expiry repeatable BullMQ job registered (every 15s)',
        HoldExpiryScheduler.name,
      );
    } catch (error) {
      this._logger.error(
        `Failed to register hold-expiry repeatable job: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
        HoldExpiryScheduler.name,
      );
    }
  }
}
