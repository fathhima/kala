import { apiClient } from '@/lib/axios';

export type AnalyticsRange = '7d' | '30d' | '90d';

export interface AdminAnalyticsData {
  range: AnalyticsRange;
  users: {
    total: number;
    students: number;
    instructors: number;
    active: number;
    blocked: number;
    newInRange: number;
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    changesRequested: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    completed: number;
    paymentPending: number;
    cancelled: number;
    expired: number;
    refunded: number;
    newInRange: number;
  };
  revenue: {
    grossVolume: number;
    netRevenue: number;
    refundedAmount: number;
    inRangeVolume: number;
    succeededPayments: number;
    failedPayments: number;
    avgBookingValue: number;
  };
  catalog: {
    activeCategories: number;
    activeSubcategories: number;
    approvedOfferings: number;
  };
  dailySeries: Array<{
    date: string;
    label: string;
    revenue: number;
    bookings: number;
    newUsers: number;
  }>;
  bookingStatusBreakdown: Array<{
    status: string;
    count: number;
  }>;
  paymentStatusBreakdown: Array<{
    status: string;
    count: number;
    amount?: number;
  }>;
  topCategories: Array<{
    id: string;
    name: string;
    bookingsCount: number;
    revenue: number;
  }>;
  topInstructors: Array<{
    profileId: string;
    name: string;
    imageUrl: string | null;
    bookingsCount: number;
    revenue: number;
  }>;
  pendingApplications: Array<{
    id: string;
    instructorName: string;
    instructorEmail: string;
    status: string;
    offeringsCount: number;
    submittedAt: string;
  }>;
  recentBookings: Array<{
    id: string;
    studentName: string;
    instructorName: string;
    offeringTitle: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export const getAdminAnalytics = async (
  range: AnalyticsRange = '30d',
): Promise<AdminAnalyticsData> => {
  const response = await apiClient.get<{
    message: string;
    data: AdminAnalyticsData;
  }>('/api/admin/analytics', {
    params: { range },
  });
  return response.data.data;
};

