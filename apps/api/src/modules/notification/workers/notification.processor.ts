import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { JOBS, QUEUES } from '@/shared/queue/queue.constants';
import { MAILER_SERVICE, type IMailerService } from '@/shared/mailer/repositories/interfaces/mailer.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { BookingCancelledJobPayload, BookingConfirmedJobPayload } from '../types/notification.type';
import { LOGGER_SERVICE, type ILoggerService } from '@/shared/logger/repositories/interfaces/logger.interface';

@Processor(QUEUES.NOTIFICATIONS)
export class NotificationProcessor extends WorkerHost {
  constructor(
    @Inject(MAILER_SERVICE)
    private readonly _mailerService: IMailerService,
    private readonly _prisma: PrismaService,
    @Inject(LOGGER_SERVICE)
    private readonly _logger: ILoggerService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    this._logger.log(
      `Processing notification job: ${job.name} (Job ID: ${job.id})`,
      NotificationProcessor.name,
    );

    switch (job.name) {
      case JOBS.BOOKING_CONFIRMED_NOTIFICATION:
        await this._handleBookingConfirmed(job.data as BookingConfirmedJobPayload);
        break;
      case JOBS.BOOKING_CANCELLED_NOTIFICATION:
        await this._handleBookingCancelled(job.data as BookingCancelledJobPayload);
        break;
      default:
        this._logger.warn(`Unknown notification job name: ${job.name}`, NotificationProcessor.name);
    }
  }

  private async _handleBookingConfirmed(data: BookingConfirmedJobPayload): Promise<void> {
    const booking = await this._prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        offering: {
          include: {
            subcategory: { select: { name: true } },
          },
        },
        slot: {
          select: {
            startTime: true,
            endTime: true,
            timezone: true,
          },
        },
        profile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!booking) {
      this._logger.warn(
        `Booking not found for confirmed notification: ${data.bookingId}`,
        NotificationProcessor.name,
      );
      return;
    }

    const title = booking.offering.title || booking.offering.subcategory.name;

    // Send confirmation to student
    try {
      await this._mailerService.sendBookingConfirmedEmail({
        recipientEmail: booking.student.email,
        recipientName: booking.student.name,
        bookingId: booking.id,
        offeringTitle: title,
        startTime: booking.slot.startTime,
        endTime: booking.slot.endTime,
        timezone: booking.slot.timezone,
        amount: booking.amount.toString(),
        currency: booking.currency,
        isInstructor: false,
      });
      this._logger.log(
        `Confirmation email sent to student (${booking.student.email}) for booking ${booking.id}`,
        NotificationProcessor.name,
      );
    } catch (err) {
      this._logger.error(
        `Failed to send student confirmation email for booking ${booking.id}: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err.stack : undefined,
        NotificationProcessor.name,
      );
      throw err; // Trigger BullMQ retry
    }

    // Send notification to instructor
    if (booking.profile?.user?.email) {
      try {
        await this._mailerService.sendBookingConfirmedEmail({
          recipientEmail: booking.profile.user.email,
          recipientName: booking.profile.user.name,
          bookingId: booking.id,
          offeringTitle: title,
          startTime: booking.slot.startTime,
          endTime: booking.slot.endTime,
          timezone: booking.slot.timezone,
          amount: booking.amount.toString(),
          currency: booking.currency,
          isInstructor: true,
        });
        this._logger.log(
          `Session notification email sent to instructor (${booking.profile.user.email}) for booking ${booking.id}`,
          NotificationProcessor.name,
        );
      } catch (err) {
        this._logger.warn(
          `Failed to send instructor notification email for booking ${booking.id}: ${err instanceof Error ? err.message : String(err)}`,
          NotificationProcessor.name,
        );
      }
    }
  }

  private async _handleBookingCancelled(data: BookingCancelledJobPayload): Promise<void> {
    const booking = await this._prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        offering: {
          include: {
            subcategory: { select: { name: true } },
          },
        },
        slot: {
          select: {
            startTime: true,
            endTime: true,
            timezone: true,
          },
        },
        profile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!booking) {
      this._logger.warn(
        `Booking not found for cancelled notification: ${data.bookingId}`,
        NotificationProcessor.name,
      );
      return;
    }

    const title = booking.offering.title || booking.offering.subcategory.name;

    // Send cancellation to student
    try {
      await this._mailerService.sendBookingCancelledEmail({
        recipientEmail: booking.student.email,
        recipientName: booking.student.name,
        bookingId: booking.id,
        offeringTitle: title,
        startTime: booking.slot.startTime,
        endTime: booking.slot.endTime,
        timezone: booking.slot.timezone,
        reason: data.reason,
        isInstructor: false,
      });
      this._logger.log(
        `Cancellation email sent to student (${booking.student.email}) for booking ${booking.id}`,
        NotificationProcessor.name,
      );
    } catch (err) {
      this._logger.error(
        `Failed to send student cancellation email for booking ${booking.id}: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err.stack : undefined,
        NotificationProcessor.name,
      );
      throw err; // Trigger BullMQ retry
    }

    // Send cancellation notice to instructor
    if (booking.profile?.user?.email) {
      try {
        await this._mailerService.sendBookingCancelledEmail({
          recipientEmail: booking.profile.user.email,
          recipientName: booking.profile.user.name,
          bookingId: booking.id,
          offeringTitle: title,
          startTime: booking.slot.startTime,
          endTime: booking.slot.endTime,
          timezone: booking.slot.timezone,
          reason: data.reason,
          isInstructor: true,
        });
        this._logger.log(
          `Cancellation notice email sent to instructor (${booking.profile.user.email}) for booking ${booking.id}`,
          NotificationProcessor.name,
        );
      } catch (err) {
        this._logger.warn(
          `Failed to send instructor cancellation email for booking ${booking.id}: ${err instanceof Error ? err.message : String(err)}`,
          NotificationProcessor.name,
        );
      }
    }
  }
}
