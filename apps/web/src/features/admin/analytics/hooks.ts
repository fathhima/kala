import { useQuery } from '@tanstack/react-query';
import { type AdminAnalyticsData, type AnalyticsRange, getAdminAnalytics } from './api';

export const adminAnalyticsKeys = {
  all: ['admin', 'analytics'] as const,
  byRange: (range: AnalyticsRange) => ['admin', 'analytics', range] as const,
};

export const useAdminAnalyticsQuery = (range: AnalyticsRange = '30d') =>
  useQuery<AdminAnalyticsData>({
    queryKey: adminAnalyticsKeys.byRange(range),
    queryFn: () => getAdminAnalytics(range),
    placeholderData: (previousData: AdminAnalyticsData | undefined) => previousData,
  });
