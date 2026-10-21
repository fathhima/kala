import { useQuery } from '@tanstack/react-query';
import { getVideoSessionAccess, getVideoIceServers } from '../api';

export const videoSessionKeys = {
  all: ['video-session'] as const,
  access: (bookingId: string) => ['video-session', 'access', bookingId] as const,
  iceServers: () => ['video-session', 'ice-servers'] as const,
};

export const useVideoSessionQuery = (bookingId: string) =>
  useQuery({
    queryKey: videoSessionKeys.access(bookingId),
    queryFn: () => getVideoSessionAccess(bookingId),
    enabled: Boolean(bookingId),
    staleTime: 1000 * 30, // 30 seconds
    retry: 1,
  });

export const useVideoIceServersQuery = () =>
  useQuery({
    queryKey: videoSessionKeys.iceServers(),
    queryFn: () => getVideoIceServers(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
