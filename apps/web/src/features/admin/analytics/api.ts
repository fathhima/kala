import {
  AdminAnalyticsApi,
  type AdminAnalyticsControllerGetAnalyticsRangeEnum,
  type AdminAnalyticsDataDto,
  Configuration,
} from '@/api';
import { apiClient } from '@/lib/axios';

const configuration = new Configuration({
  basePath: import.meta.env.VITE_API_URL,
});

const adminAnalyticsApi = new AdminAnalyticsApi(configuration, undefined, apiClient);

export type AnalyticsRange = AdminAnalyticsControllerGetAnalyticsRangeEnum;
export type AdminAnalyticsData = AdminAnalyticsDataDto;

export const getAdminAnalytics = async (
  range: AnalyticsRange = '30d',
): Promise<AdminAnalyticsData> => {
  const response = await adminAnalyticsApi.adminAnalyticsControllerGetAnalytics(range);
  return response.data.data;
};
