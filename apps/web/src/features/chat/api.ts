import {
  ChatApi,
  type ChatControllerGetRoomsRoleEnum,
  type ChatMessageDto,
  type ChatRoomDto,
  Configuration,
  type PaginatedChatMessagesDataDto,
  type SendMessageDto,
} from '@/api';
import { apiClient } from '@/lib/axios';

export type ChatRoleFilter = ChatControllerGetRoomsRoleEnum;
export type ChatRoomListItem = ChatRoomDto;

const configuration = new Configuration({
  basePath: import.meta.env.VITE_API_URL,
});

const chatApi = new ChatApi(configuration, undefined, apiClient);

export const getChatRooms = async (role?: ChatRoleFilter): Promise<ChatRoomListItem[]> => {
  const response = await chatApi.chatControllerGetRooms(role);
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

export const markChatAsRead = async (bookingId: string): Promise<{ count: number }> => {
  const response = await chatApi.chatControllerMarkRead(bookingId);
  return response.data as unknown as { count: number };
};
