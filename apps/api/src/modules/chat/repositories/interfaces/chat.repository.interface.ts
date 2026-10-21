import { MessageType } from '../../enums/message-type.enum';
import {
  ChatMessageEntity,
  PaginatedChatMessageEntity,
} from '../../entities/chat-message.entity';
import { ChatRoomEntity } from '../../entities/chat-room.entity';

export const CHAT_REPOSITORY = Symbol('CHAT_REPOSITORY');

export interface IChatRepository {
  findRoomByBookingId(bookingId: string): Promise<ChatRoomEntity | null>;
  findRoomById(roomId: string): Promise<ChatRoomEntity | null>;
  createRoom(bookingId: string): Promise<ChatRoomEntity>;
  saveMessage(data: {
    roomId: string;
    senderId: string;
    content: string;
    type?: MessageType;
  }): Promise<ChatMessageEntity>;
  getMessages(
    roomId: string,
    query: { page: number; limit: number },
  ): Promise<PaginatedChatMessageEntity>;
  markMessagesAsRead(roomId: string, recipientUserId: string): Promise<number>;
  getUnreadCount(roomId: string, recipientUserId: string): Promise<number>;
  bookingExists(bookingId: string): Promise<boolean>;
}
