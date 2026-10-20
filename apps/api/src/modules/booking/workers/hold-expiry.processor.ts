import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { QUEUES } from '@/shared/queue/queue.constants';
import { BOOKING_SERVICE, type IBookingService } from '../services/interfaces/booking.service.interface';
import { LOGGER_SERVICE, type ILoggerService } from '@/shared/logger/repositories/interfaces/logger.interface';

@Processor(QUEUES.HOLD_EXPIRY)
export class HoldExpiryProcessor extends WorkerHost {
  constructor(
    @Inject(BOOKING_SERVICE)
    private readonly _bookingService: IBookingService,
    @Inject(LOGGER_SERVICE)
    private readonly _logger: ILoggerService,
  ) {
    super();
  }

  async process(job: Job): Promise<number> {
    try {
      const expiredCount = await this._bookingService.expireHolds();
      if (expiredCount > 0) {
        this._logger.log(
          `Expired ${expiredCount} stale booking holds [jobId=${job.id}]`,
          HoldExpiryProcessor.name,
        );
      }
      return expiredCount;
    } catch (error) {
      this._logger.error(
        `Failed to expire booking holds: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
        HoldExpiryProcessor.name,
      );
      throw error;
    }
  }
}
