import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/features/auth/store';
import { useChatMessagesQuery, useChatRoomQuery } from './useChatQueries';
import { sendChatMessageRest } from '../api';
import type { ChatMessageDto } from '@/api';

export interface UseChatRoomReturn {
  messages: ChatMessageDto[];
  isLoading: boolean;
  isConnected: boolean;
  canWrite: boolean;
  readOnlyReason?: string;
  isOtherTyping: boolean;
  room: ReturnType<typeof useChatRoomQuery>['data'];
  sendMessage: (content: string) => Promise<void>;
  sendTyping: (isTyping: boolean) => void;
  markAsRead: () => void;
}

export function useChatRoom(bookingId: string): UseChatRoomReturn {
  const { user, accessToken } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  // Initial HTTP queries for instant hydration
  const { data: room, isLoading: isRoomLoading } = useChatRoomQuery(bookingId);
  const { data: initialMessagesData, isLoading: isMessagesLoading } = useChatMessagesQuery(bookingId, 1, 100);

  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [roomAccess, setRoomAccess] = useState<{
    canWrite: boolean;
    readOnlyReason?: string;
  }>({
    canWrite: room?.canWrite ?? true,
    readOnlyReason: room?.readOnlyReason,
  });

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync initial query messages to local state
  useEffect(() => {
    if (initialMessagesData?.items) {
      setMessages(initialMessagesData.items);
    }
  }, [initialMessagesData]);

  // Sync room permissions
  useEffect(() => {
    if (room) {
      setRoomAccess({
        canWrite: room.canWrite,
        readOnlyReason: room.readOnlyReason,
      });
    }
  }, [room]);

  // Establish Socket.io connection
  useEffect(() => {
    if (!bookingId || !accessToken) return;

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const socket = io(`${apiBaseUrl}/chat`, {
      auth: { token: `Bearer ${accessToken}` },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_room', { bookingId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room_joined', (data: { canWrite: boolean; readOnlyReason?: string }) => {
      if (typeof data.canWrite === 'boolean') {
        setRoomAccess({
          canWrite: data.canWrite,
          readOnlyReason: data.readOnlyReason,
        });
      }
    });

    socket.on('new_message', (incoming: ChatMessageDto) => {
      setMessages((prev) => {
        // If message was optimistically added with matching tempId
        if (incoming.tempId) {
          const index = prev.findIndex((m) => m.tempId === incoming.tempId);
          if (index !== -1) {
            const next = [...prev];
            next[index] = incoming;
            return next;
          }
        }

        // Avoid duplicates by ID
        if (prev.some((m) => m.id === incoming.id)) {
          return prev;
        }

        return [...prev, incoming];
      });
    });

    socket.on('user_typing', (payload: { userId: string; isTyping: boolean }) => {
      if (payload.userId !== user?.id) {
        setIsOtherTyping(Boolean(payload.isTyping));

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        if (payload.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsOtherTyping(false);
          }, 3000);
        }
      }
    });

    socket.on('messages_read', (payload: { readerId: string }) => {
      if (payload.readerId !== user?.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === user?.id ? { ...msg, isRead: true } : msg,
          ),
        );
      }
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [bookingId, accessToken, user?.id]);

  // Send message with optimistic update & fallback
  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || !user) return;

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const optimisticMessage: ChatMessageDto = {
        id: tempId,
        tempId,
        roomId: room?.id ?? '',
        senderId: user.id,
        content: text,
        type: 'TEXT' as const,
        isRead: false,
        readAt: null,
        createdAt: new Date().toISOString(),
        sender: {
          id: user.id,
          name: user.name,
          imageUrl: user.imageUrl ?? null,
        },
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      const socket = socketRef.current;
      if (socket && socket.connected) {
        socket.emit(
          'send_message',
          {
            bookingId,
            content: text,
            tempId,
          },
          (response: { success: boolean; data?: ChatMessageDto }) => {
            if (response?.success && response.data) {
              setMessages((prev) =>
                prev.map((m) => (m.tempId === tempId ? response.data! : m)),
              );
            }
          },
        );
      } else {
        // Fallback to REST API
        try {
          const sent = await sendChatMessageRest(bookingId, {
            content: text,
            tempId,
          });
          setMessages((prev) =>
            prev.map((m) => (m.tempId === tempId ? sent : m)),
          );
        } catch {
          // If failed, remove optimistic message
          setMessages((prev) => prev.filter((m) => m.tempId !== tempId));
        }
      }
    },
    [bookingId, user, room?.id],
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      const socket = socketRef.current;
      if (socket && socket.connected) {
        socket.emit('typing', { bookingId, isTyping });
      }
    },
    [bookingId],
  );

  const markAsRead = useCallback(() => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit('mark_read', { bookingId });
    }
  }, [bookingId]);

  return {
    messages,
    isLoading: isRoomLoading || isMessagesLoading,
    isConnected,
    canWrite: roomAccess.canWrite,
    readOnlyReason: roomAccess.readOnlyReason,
    isOtherTyping,
    room,
    sendMessage,
    sendTyping,
    markAsRead,
  };
}
