import {
  ChatApi,
  Configuration,
  type ChatMessageDto,
  type ChatRoomDto,
  type PaginatedChatMessagesDataDto,
  type SendMessageDto,
} from '@/api';
import { apiClient } from '@/lib/axios';

const configuration = new Configuration({
  basePath: import.meta.env.VITE_API_URL,
});

const chatApi = new ChatApi(configuration, undefined, apiClient);

export const getChatRoom = async (bookingId: string): Promise<ChatRoomDto> => {
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
