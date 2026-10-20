import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOBS, QUEUES } from '@/shared/queue/queue.constants';
import { BookingConfirmedEvent } from '../events/booking-confirmed.event';
import { BookingCancelledEvent } from '@/modules/booking/events/booking-cancelled.event';
import { BookingCancelledJobPayload, BookingConfirmedJobPayload } from '../types/notification.type';
import { LOGGER_SERVICE, type ILoggerService } from '@/shared/logger/repositories/interfaces/logger.interface';

@Injectable()
export class BookingNotificationListener {
  constructor(
    @InjectQueue(QUEUES.NOTIFICATIONS)
    private readonly _notificationQueue: Queue,
    @Inject(LOGGER_SERVICE)
    private readonly _logger: ILoggerService,
  ) {}

  @OnEvent('booking.confirmed')
  async handleBookingConfirmed(event: BookingConfirmedEvent): Promise<void> {
    try {
      const payload: BookingConfirmedJobPayload = { bookingId: event.bookingId };
      await this._notificationQueue.add(
        JOBS.BOOKING_CONFIRMED_NOTIFICATION,
        payload,
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: true,
        },
      );
      this._logger.log(
        `Enqueued confirmation email job for booking: ${event.bookingId}`,
        BookingNotificationListener.name,
      );
    } catch (error) {
      this._logger.error(
        `Failed to enqueue booking confirmed email job for ${event.bookingId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
        BookingNotificationListener.name,
      );
    }
  }

  @OnEvent('booking.cancelled')
  async handleBookingCancelled(event: BookingCancelledEvent): Promise<void> {
    try {
      const payload: BookingCancelledJobPayload = {
        bookingId: event.bookingId,
        refundPercentage: event.refundPercentage,
        reason: event.reason,
      };
      await this._notificationQueue.add(
        JOBS.BOOKING_CANCELLED_NOTIFICATION,
        payload,
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: true,
        },
      );
      this._logger.log(
        `Enqueued cancellation email job for booking: ${event.bookingId}`,
        BookingNotificationListener.name,
      );
    } catch (error) {
      this._logger.error(
        `Failed to enqueue booking cancelled email job for ${event.bookingId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
        BookingNotificationListener.name,
      );
    }
  }
}
