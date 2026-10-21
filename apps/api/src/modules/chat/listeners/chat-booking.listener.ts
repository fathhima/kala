import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BookingConfirmedEvent } from '@/modules/notification/events/booking-confirmed.event';
import { CHAT_REPOSITORY, type IChatRepository } from '../repositories/interfaces/chat.repository.interface';
import { LOGGER_SERVICE, type ILoggerService } from '@/shared/logger/repositories/interfaces/logger.interface';
import { MessageType } from '../enums/message-type.enum';

@Injectable()
export class ChatBookingListener {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly _chatRepo: IChatRepository,
    @Inject(LOGGER_SERVICE)
    private readonly _logger: ILoggerService,
  ) {}

  @OnEvent('booking.confirmed')
  async handleBookingConfirmed(event: BookingConfirmedEvent): Promise<void> {
    try {
      const room = await this._chatRepo.createRoom(event.bookingId);

      // Post introductory system message if room has no messages
      if (!room.lastMessage) {
        await this._chatRepo.saveMessage({
          roomId: room.id,
          senderId: room.student.userId,
          content:
            'Booking confirmed! The chat room is now open for session coordination, material preparation, and questions.',
          type: MessageType.SYSTEM,
        });
      }

      this._logger.log(
        `Provisioned chat room ${room.id} for confirmed booking ${event.bookingId}`,
        ChatBookingListener.name,
      );
    } catch (error) {
      this._logger.error(
        `Failed to provision chat room for booking ${event.bookingId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
        ChatBookingListener.name,
      );
    }
  }
}
