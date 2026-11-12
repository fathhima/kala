import {
  ChatApi,
  Configuration,
  type ChatMessageDto,
  type ChatRoomDto,
  type PaginatedChatMessagesDataDto,
  type SendMessageDto,
} from '@/api';
import { apiClient } from '@/lib/axios';
import type { ApiEnvelope } from '@/types/api-envelope';

export type ChatRoleFilter = 'STUDENT' | 'INSTRUCTOR';
export type ChatRoomListItem = ChatRoomDto & { offeringTitle?: string };

const configuration = new Configuration({
  basePath: import.meta.env.VITE_API_URL,
});

const chatApi = new ChatApi(configuration, undefined, apiClient);

export const getChatRooms = async (
  role?: ChatRoleFilter,
): Promise<ChatRoomListItem[]> => {
  const response = await apiClient.get<ApiEnvelope<ChatRoomListItem[]>>(
    '/api/chat/rooms',
    { params: role ? { role } : undefined },
  );
  return response.data.data;
};

export const getChatRoom = async (bookingId: string): Promise<ChatRoomListItem> => {
  const response = await chatApi.chatControllerGetRoom(bookingId);
  return response.data.data;
};

export const getChatMessages = async (
  bookingId: string,
  page: number = 1,
  limit: number = 50,
): Promise<PaginatedChatMessagesDataDto> => {
  const response = await chatApi.chatControllerGetMessages(bookingId, page, limit);
  return response.data.data;
};

export const sendChatMessageRest = async (
  bookingId: string,
  dto: SendMessageDto,
): Promise<ChatMessageDto> => {
  const response = await chatApi.chatControllerSendMessage(bookingId, dto);
  return response.data.data;
};

export const markChatAsRead = async (
  bookingId: string,
): Promise<{ count: number }> => {
  const response = await chatApi.chatControllerMarkRead(bookingId);
  return response.data as unknown as { count: number };
};
