import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  InstructorApplicationStatus,
  OfferingStatus,
  PaymentStatus,
  Role,
} from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import type { AnalyticsRange } from '../dto/admin-analytics-query.dto';
import type {
  AdminAnalyticsDataDto,
  AdminDailyPointDto,
} from '../dto/admin-analytics-response.dto';

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(range: AnalyticsRange = '30d'): Promise<AdminAnalyticsDataDto> {
    const days = RANGE_DAYS[range];
    const now = new Date();
    const startDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1), 0, 0, 0, 0),
    );

    const [
      totalUsers,
      studentUsers,
      instructorUsers,
      activeUsers,
      newUsersInRange,
      usersInRangeRecords,
      applicationGroups,
      bookingGroups,
      newBookingsInRange,
      bookingsInRangeRecords,
      paymentGroups,
      paymentsInRangeRecords,
      activeCategories,
      activeSubcategories,
      approvedOfferings,
      paidBookingsForBreakdown,
      pendingApplicationsRecords,
      recentBookingsRecords,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { roles: { has: Role.STUDENT } } }),
      this.prisma.user.count({ where: { roles: { has: Role.INSTRUCTOR } } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      this.prisma.instructorApplication.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.booking.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.booking.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.booking.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      this.prisma.payment.groupBy({
        by: ['status'],
        _count: { _all: true },
        _sum: { amount: true, refundAmount: true },
      }),
      this.prisma.payment.findMany({
        where: {
          createdAt: { gte: startDate },
          status: {
            in: [PaymentStatus.SUCCEEDED, PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED],
          },
        },
        select: { amount: true, paidAt: true, createdAt: true },
      }),
      this.prisma.category.count({ where: { isActive: true } }),
      this.prisma.subcategory.count({ where: { isActive: true } }),
      this.prisma.instructorOffering.count({
        where: { status: OfferingStatus.APPROVED },
      }),
      this.prisma.booking.findMany({
        where: {
          status: {
            in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
          },
        },
        select: {
          amount: true,
          profileId: true,
          profile: {
            select: {
              id: true,
              user: { select: { name: true, imageUrl: true } },
            },
          },
          offering: {
            select: {
              subcategory: {
                select: {
                  category: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.instructorApplication.findMany({
        where: {
          status: {
            in: [
              InstructorApplicationStatus.PENDING,
              InstructorApplicationStatus.CHANGES_REQUESTED,
            ],
          },
        },
        orderBy: { submittedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          status: true,
          submittedAt: true,
          profile: {
            select: {
              user: { select: { name: true, email: true } },
            },
          },
          _count: { select: { offerings: true } },
        },
      }),
      this.prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          student: { select: { name: true } },
          profile: {
            select: {
              user: { select: { name: true } },
            },
          },
          offering: {
            select: {
              title: true,
              subcategory: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    // ─── Application Metrics ──────────────────────────────────────────────
    const appCountMap = new Map<InstructorApplicationStatus, number>();
    let totalApplications = 0;
    for (const row of applicationGroups) {
      appCountMap.set(row.status, row._count._all);
      totalApplications += row._count._all;
    }

    // ─── Booking Metrics ──────────────────────────────────────────────────
    const bookingCountMap = new Map<BookingStatus, number>();
    let totalBookings = 0;
    for (const row of bookingGroups) {
      bookingCountMap.set(row.status, row._count._all);
      totalBookings += row._count._all;
    }

    const bookingStatusBreakdown = Object.values(BookingStatus)
      .map((status) => ({
        status,
        count: bookingCountMap.get(status) ?? 0,
      }))
      .filter((item) => item.count > 0);

    // ─── Payment & Revenue Metrics ────────────────────────────────────────
    let grossVolume = 0;
    let refundedAmount = 0;
    let succeededPayments = 0;
    let failedPayments = 0;

    const paymentStatusBreakdown = paymentGroups.map((row) => {
      const count = row._count._all;
      const sumAmount = Number(row._sum.amount ?? 0);
      const sumRefund = Number(row._sum.refundAmount ?? 0);

      if (
        row.status === PaymentStatus.SUCCEEDED ||
        row.status === PaymentStatus.REFUNDED ||
        row.status === PaymentStatus.PARTIALLY_REFUNDED
      ) {
        grossVolume += sumAmount;
      }

      if (row.status === PaymentStatus.SUCCEEDED) {
        succeededPayments += count;
      } else if (row.status === PaymentStatus.FAILED) {
        failedPayments += count;
      } else if (
        row.status === PaymentStatus.REFUNDED ||
        row.status === PaymentStatus.PARTIALLY_REFUNDED
      ) {
        refundedAmount += sumRefund > 0 ? sumRefund : sumAmount;
      }

      return {
        status: row.status,
        count,
        amount: sumAmount,
      };
    });

    const netRevenue = Math.max(0, grossVolume - refundedAmount);
    const paidCountForAvg =
      succeededPayments +
      (paymentGroups.find((g) => g.status === PaymentStatus.PARTIALLY_REFUNDED)?._count._all ?? 0);
    const avgBookingValue = paidCountForAvg > 0 ? Math.round(grossVolume / paidCountForAvg) : 0;

    // ─── Daily Time Series ────────────────────────────────────────────────
    const seriesMap = new Map<string, AdminDailyPointDto>();
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate.getTime() + i * 86_400_000);
      const key = toDateKey(d);
      seriesMap.set(key, {
        date: key,
        label: formatDateLabel(d),
        revenue: 0,
        bookings: 0,
        newUsers: 0,
      });
    }

    let inRangeVolume = 0;
    for (const p of paymentsInRangeRecords) {
      const amt = Number(p.amount ?? 0);
      inRangeVolume += amt;
      const key = toDateKey(p.paidAt ?? p.createdAt);
      const bucket = seriesMap.get(key);
      if (bucket) {
        bucket.revenue += amt;
      }
    }

    for (const b of bookingsInRangeRecords) {
      const key = toDateKey(b.createdAt);
      const bucket = seriesMap.get(key);
      if (bucket) {
        bucket.bookings += 1;
      }
    }

    for (const u of usersInRangeRecords) {
      const key = toDateKey(u.createdAt);
      const bucket = seriesMap.get(key);
      if (bucket) {
        bucket.newUsers += 1;
      }
    }

    const dailySeries = Array.from(seriesMap.values());

    // ─── Top Categories & Top Instructors ─────────────────────────────────
    const categoryStats = new Map<
      string,
      { id: string; name: string; bookingsCount: number; revenue: number }
    >();
    const instructorStats = new Map<
      string,
      {
        profileId: string;
        name: string;
        imageUrl: string | null;
        bookingsCount: number;
        revenue: number;
      }
    >();

    for (const booking of paidBookingsForBreakdown) {
      const amount = Number(booking.amount ?? 0);
      const cat = booking.offering?.subcategory?.category;
      if (cat) {
        const existing = categoryStats.get(cat.id) ?? {
          id: cat.id,
          name: cat.name,
          bookingsCount: 0,
          revenue: 0,
        };
        existing.bookingsCount += 1;
        existing.revenue += amount;
        categoryStats.set(cat.id, existing);
      }

      if (booking.profile) {
        const existingInst = instructorStats.get(booking.profileId) ?? {
          profileId: booking.profileId,
          name: booking.profile.user?.name ?? 'Instructor',
          imageUrl: booking.profile.user?.imageUrl ?? null,
          bookingsCount: 0,
          revenue: 0,
        };
        existingInst.bookingsCount += 1;
        existingInst.revenue += amount;
        instructorStats.set(booking.profileId, existingInst);
      }
    }

    const topCategories = Array.from(categoryStats.values())
      .sort((a, b) => b.revenue - a.revenue || b.bookingsCount - a.bookingsCount)
      .slice(0, 6);

    const topInstructors = Array.from(instructorStats.values())
      .sort((a, b) => b.revenue - a.revenue || b.bookingsCount - a.bookingsCount)
      .slice(0, 5);

    return {
      range,
      users: {
        total: totalUsers,
        students: studentUsers,
        instructors: instructorUsers,
        active: activeUsers,
        blocked: Math.max(0, totalUsers - activeUsers),
        newInRange: newUsersInRange,
      },
      applications: {
        total: totalApplications,
        pending: appCountMap.get(InstructorApplicationStatus.PENDING) ?? 0,
        approved: appCountMap.get(InstructorApplicationStatus.APPROVED) ?? 0,
        rejected: appCountMap.get(InstructorApplicationStatus.REJECTED) ?? 0,
        changesRequested: appCountMap.get(InstructorApplicationStatus.CHANGES_REQUESTED) ?? 0,
      },
      bookings: {
        total: totalBookings,
        confirmed: bookingCountMap.get(BookingStatus.CONFIRMED) ?? 0,
        completed: bookingCountMap.get(BookingStatus.COMPLETED) ?? 0,
        paymentPending: bookingCountMap.get(BookingStatus.PAYMENT_PENDING) ?? 0,
        cancelled: bookingCountMap.get(BookingStatus.CANCELLED) ?? 0,
        expired: bookingCountMap.get(BookingStatus.EXPIRED) ?? 0,
        refunded:
          (bookingCountMap.get(BookingStatus.REFUNDED) ?? 0) +
          (bookingCountMap.get(BookingStatus.REFUND_PENDING) ?? 0),
        newInRange: newBookingsInRange,
      },
      revenue: {
        grossVolume,
        netRevenue,
        refundedAmount,
        inRangeVolume,
        succeededPayments,
        failedPayments,
        avgBookingValue,
      },
      catalog: {
        activeCategories,
        activeSubcategories,
        approvedOfferings,
      },
      dailySeries,
      bookingStatusBreakdown,
      paymentStatusBreakdown,
      topCategories,
      topInstructors,
      pendingApplications: pendingApplicationsRecords.map((app) => ({
        id: app.id,
        instructorName: app.profile?.user?.name ?? 'Applicant',
        instructorEmail: app.profile?.user?.email ?? '',
        status: app.status,
        offeringsCount: app._count.offerings,
        submittedAt: app.submittedAt.toISOString(),
      })),
      recentBookings: recentBookingsRecords.map((b) => ({
        id: b.id,
        studentName: b.student?.name ?? 'Student',
        instructorName: b.profile?.user?.name ?? 'Instructor',
        offeringTitle: b.offering?.title || b.offering?.subcategory?.name || 'Session',
        amount: Number(b.amount ?? 0),
        status: b.status,
        createdAt: b.createdAt.toISOString(),
      })),
    };
  }
}
