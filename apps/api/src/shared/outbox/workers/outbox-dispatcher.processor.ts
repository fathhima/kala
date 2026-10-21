import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JOBS, OUTBOX_EVENT_TYPES, QUEUES } from '@/shared/queue/queue.constants';
import { OUTBOX_SERVICE, type IOutboxService, OutboxEventRecord } from '../repositories/interfaces/outbox.interface';
import { LOGGER_SERVICE, type ILoggerService } from '@/shared/logger/repositories/interfaces/logger.interface';
import { SLOT_SERVICE, type ISlotService } from '@/modules/slot/services/interfaces/slot.service.interface';

@Processor(QUEUES.OUTBOX)
export class OutboxDispatcherProcessor extends WorkerHost {
  constructor(
    @Inject(OUTBOX_SERVICE)
    private readonly _outboxService: IOutboxService,
    @InjectQueue(QUEUES.NOTIFICATIONS)
    private readonly _notificationQueue: Queue,
    @Inject(SLOT_SERVICE)
    private readonly _slotService: ISlotService,
    @Inject(LOGGER_SERVICE)
    private readonly _logger: ILoggerService,
  ) {
    super();
  }

  async process(job: Job): Promise<number> {
    const events = await this._outboxService.fetchAndLockPendingEvents(25);
    if (!events.length) return 0;

    this._logger.log(`Dispatching ${events.length} outbox events [jobId=${job.id}]`, OutboxDispatcherProcessor.name);

    let processedCount = 0;
    for (const event of events) {
      try {
        await this._dispatchEvent(event);
        await this._outboxService.markAsProcessed(event.id);
        processedCount++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this._logger.error(
          `Failed to dispatch outbox event ${event.id} (${event.eventType}): ${errorMsg}`,
          error instanceof Error ? error.stack : undefined,
          OutboxDispatcherProcessor.name,
        );
        await this._outboxService.markAsFailed(event.id, errorMsg);
      }
    }

    return processedCount;
  }

  private async _dispatchEvent(event: OutboxEventRecord): Promise<void> {
    const payload = event.payload;

    switch (event.eventType) {
      case OUTBOX_EVENT_TYPES.BOOKING_HELD:
        if (payload?.profileId) {
          await this._slotService.invalidateAvailabilityCache(payload.profileId);
        }
        break;

      case OUTBOX_EVENT_TYPES.BOOKING_CONFIRMED:
        await this._notificationQueue.add(
          JOBS.BOOKING_CONFIRMED_NOTIFICATION,
          { bookingId: payload.bookingId },
          {
            jobId: `booking-confirmed-${payload.bookingId}`,
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: true,
          },
        );
        if (payload?.profileId) {
          await this._slotService.invalidateAvailabilityCache(payload.profileId);
        }
        break;

      case OUTBOX_EVENT_TYPES.BOOKING_CANCELLED:
        await this._notificationQueue.add(
          JOBS.BOOKING_CANCELLED_NOTIFICATION,
          {
            bookingId: payload.bookingId,
            reason: payload.reason,
          },
          {
            jobId: `booking-cancelled-${payload.bookingId}`,
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: true,
          },
        );
        if (payload?.profileId) {
          await this._slotService.invalidateAvailabilityCache(payload.profileId);
        }
        break;

      default:
        this._logger.warn(`Unhandled outbox event type: ${event.eventType}`, OutboxDispatcherProcessor.name);
    }
  }
}
