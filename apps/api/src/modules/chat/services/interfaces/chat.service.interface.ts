import { MessageType } from '../../enums/message-type.enum';
import {
  ChatMessageResponseDto,
  ChatRoomResponseDto,
  PaginatedChatMessagesResponseDto,
} from '../../dto/response/chat-response.dto';

export const CHAT_SERVICE = Symbol('CHAT_SERVICE');

export interface IChatService {
  getOrCreateRoom(userId: string, bookingId: string): Promise<ChatRoomResponseDto>;
  getRoomMessages(
    userId: string,
    bookingId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedChatMessagesResponseDto>;
  sendMessage(
    userId: string,
    bookingId: string,
    content: string,
    type?: MessageType,
    tempId?: string,
  ): Promise<ChatMessageResponseDto>;
  markAsRead(userId: string, bookingId: string): Promise<{ success: boolean; count: number }>;
  checkRoomAccess(
    userId: string,
    bookingId: string,
  ): Promise<{ roomId: string; canWrite: boolean; readOnlyReason?: string }>;
}
