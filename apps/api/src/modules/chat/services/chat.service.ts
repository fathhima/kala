import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IChatService } from './interfaces/chat.service.interface';
import {
  CHAT_REPOSITORY,
  type IChatRepository,
} from '../repositories/interfaces/chat.repository.interface';
import {
  ChatMessageResponseDto,
  ChatRoomResponseDto,
  PaginatedChatMessagesResponseDto,
} from '../dto/response/chat-response.dto';
import { ChatRoomEntity } from '../entities/chat-room.entity';
import { MessageType } from '../enums/message-type.enum';

const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours post-session

@Injectable()
export class ChatService implements IChatService {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly _chatRepo: IChatRepository,
  ) {}

  async getOrCreateRoom(userId: string, bookingId: string): Promise<ChatRoomResponseDto> {
    const access = await this._resolveRoomAndPermission(userId, bookingId);
    const unreadCount = await this._chatRepo.getUnreadCount(access.room.id, userId);

    return ChatRoomResponseDto.fromEntity('Chat room fetched successfully', access.room, {
      canWrite: access.canWrite,
      readOnlyReason: access.readOnlyReason,
      unreadCount,
    });
  }

  async getRoomMessages(
    userId: string,
    bookingId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedChatMessagesResponseDto> {
    const access = await this._resolveRoomAndPermission(userId, bookingId);

    const paginatedEntity = await this._chatRepo.getMessages(access.room.id, {
      page,
      limit,
    });

    return PaginatedChatMessagesResponseDto.fromEntity(
      'Messages fetched successfully',
      paginatedEntity,
    );
  }

  async sendMessage(
    userId: string,
    bookingId: string,
    content: string,
    type?: MessageType,
    tempId?: string,
  ): Promise<ChatMessageResponseDto> {
    const access = await this._resolveRoomAndPermission(userId, bookingId);

    if (!access.canWrite) {
      throw new ForbiddenException(
        access.readOnlyReason ?? 'Chat is in read-only mode.',
      );
    }

    const messageEntity = await this._chatRepo.saveMessage({
      roomId: access.room.id,
      senderId: userId,
      content,
      type: type ?? MessageType.TEXT,
    });

    return ChatMessageResponseDto.fromEntity(
      'Message sent successfully',
      messageEntity,
      tempId,
    );
  }

  async markAsRead(
    userId: string,
    bookingId: string,
  ): Promise<{ success: boolean; count: number }> {
    const access = await this._resolveRoomAndPermission(userId, bookingId);
    const count = await this._chatRepo.markMessagesAsRead(access.room.id, userId);
    return { success: true, count };
  }

  async checkRoomAccess(
    userId: string,
    bookingId: string,
  ): Promise<{ roomId: string; canWrite: boolean; readOnlyReason?: string }> {
    const access = await this._resolveRoomAndPermission(userId, bookingId);
    return {
      roomId: access.room.id,
      canWrite: access.canWrite,
      readOnlyReason: access.readOnlyReason,
    };
  }

  private async _resolveRoomAndPermission(
    userId: string,
    bookingId: string,
  ): Promise<{
    room: ChatRoomEntity;
    canWrite: boolean;
    readOnlyReason?: string;
  }> {
    let room = await this._chatRepo.findRoomByBookingId(bookingId);

    if (!room) {
      const exists = await this._chatRepo.bookingExists(bookingId);
      if (!exists) {
        throw new NotFoundException(`Booking with ID ${bookingId} not found`);
      }

      room = await this._chatRepo.createRoom(bookingId);
    }

    const isStudent = room.student.userId === userId;
    const isInstructor = room.instructor.userId === userId;

    if (!isStudent && !isInstructor) {
      throw new ForbiddenException(
        'You are not authorized to access this conversation.',
      );
    }

    const { canWrite, readOnlyReason } = this._evaluateCanWrite(
      room.bookingStatus,
      room.slotEndTime,
    );

    return { room, canWrite, readOnlyReason };
  }

  private _evaluateCanWrite(
    status: string,
    slotEndTime: Date,
  ): { canWrite: boolean; readOnlyReason?: string } {
    if (status === 'PAYMENT_PENDING') {
      return {
        canWrite: false,
        readOnlyReason: 'Chat will unlock once payment has been confirmed.',
      };
    }

    if (['CANCELLED', 'REFUNDED', 'EXPIRED'].includes(status)) {
      return {
        canWrite: false,
        readOnlyReason:
          'This booking has been cancelled or closed. Chat is archived in read-only mode.',
      };
    }

    if (['CONFIRMED', 'COMPLETED'].includes(status)) {
      const graceEnd = new Date(new Date(slotEndTime).getTime() + GRACE_PERIOD_MS);
      const isPastGrace = new Date() > graceEnd;

      if (isPastGrace) {
        return {
          canWrite: false,
          readOnlyReason:
            'The 24-hour post-session grace window has expired. Chat is archived in read-only mode.',
        };
      }

      return { canWrite: true };
    }

    return {
      canWrite: false,
      readOnlyReason: 'Chat is currently not active for this booking.',
    };
  }
}
