import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChatRoom,
  getChatMessages,
  markChatAsRead,
  sendChatMessageRest,
} from '../api';
import type { SendMessageDto } from '@/api';

export const chatKeys = {
  all: ['chat'] as const,
  room: (bookingId: string) => ['chat', 'room', bookingId] as const,
  messages: (bookingId: string) => ['chat', 'messages', bookingId] as const,
};

export const useChatRoomQuery = (bookingId: string) =>
  useQuery({
    queryKey: chatKeys.room(bookingId),
    queryFn: () => getChatRoom(bookingId),
    enabled: Boolean(bookingId),
    staleTime: 1000 * 60, // 1 minute
  });

export const useChatMessagesQuery = (bookingId: string, page = 1, limit = 50) =>
  useQuery({
    queryKey: [...chatKeys.messages(bookingId), { page, limit }],
    queryFn: () => getChatMessages(bookingId, page, limit),
    enabled: Boolean(bookingId),
    staleTime: 1000 * 30, // 30 seconds
  });

export const useSendChatMessageMutation = (bookingId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: SendMessageDto) => sendChatMessageRest(bookingId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(bookingId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.room(bookingId) });
    },
  });
};

export const useMarkChatReadMutation = (bookingId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markChatAsRead(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.room(bookingId) });
    },
  });
};
