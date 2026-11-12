import { Injectable } from '@nestjs/common';
import {
  AvailabilityRuleStatus,
  BookingStatus,
  OfferingStatus,
  PaymentStatus,
  SlotStatus,
} from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import type { InstructorAnalyticsRange } from '../dto/request/instructor-analytics-query.dto';
import type {
  InstructorAnalyticsDataDto,
  InstructorDailyPointDto,
} from '../dto/response/instructor-analytics-response.dto';

const RANGE_DAYS: Record<InstructorAnalyticsRange, number> = {
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
export class InstructorAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(
    userId: string,
    range: InstructorAnalyticsRange = '30d',
  ): Promise<InstructorAnalyticsDataDto> {
    const days = RANGE_DAYS[range];
    const now = new Date();
    const startDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1), 0, 0, 0, 0),
    );
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));

    const seriesMap = new Map<string, InstructorDailyPointDto>();
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate.getTime() + i * 86_400_000);
      const key = toDateKey(d);
      seriesMap.set(key, {
        date: key,
        label: formatDateLabel(d),
        earnings: 0,
        bookings: 0,
      });
    }

    const profile = await this.prisma.instructorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return {
        range,
        earnings: {
          totalEarned: 0,
          thisMonthEarned: 0,
          inRangeEarned: 0,
          totalRefunded: 0,
          pendingEarnings: 0,
          avgSessionValue: 0,
        },
        sessions: {
          total: 0,
          upcomingConfirmed: 0,
          completed: 0,
          cancelled: 0,
          completionRate: 100,
          uniqueStudents: 0,
        },
        capacity: {
          openUpcomingSlots: 0,
          activeWeeklyRules: 0,
        },
        offerings: {
          total: 0,
          approved: 0,
          pending: 0,
          needsAttention: 0,
        },
        dailySeries: Array.from(seriesMap.values()),
        offeringPerformance: [],
        upcomingSessions: [],
      };
    }

    const [
      offeringGroups,
      bookingGroups,
      payments,
      openUpcomingSlots,
      activeWeeklyRules,
      confirmedCompletedBookings,
      upcomingConfirmedCount,
      upcomingSessionsRecords,
      bookingsInRange,
    ] = await Promise.all([
      this.prisma.instructorOffering.groupBy({
        by: ['status'],
        where: { profileId: profile.id },
        _count: { _all: true },
      }),
      this.prisma.booking.groupBy({
        by: ['status'],
        where: { profileId: profile.id },
        _count: { _all: true },
      }),
      this.prisma.payment.findMany({
        where: { booking: { profileId: profile.id } },
        select: {
          amount: true,
          refundAmount: true,
          status: true,
          paidAt: true,
          createdAt: true,
        },
      }),
      this.prisma.availabilitySlot.count({
        where: {
          profileId: profile.id,
          status: SlotStatus.AVAILABLE,
          startTime: { gte: now },
        },
      }),
      this.prisma.availabilityRule.count({
        where: {
          profileId: profile.id,
          status: AvailabilityRuleStatus.ACTIVE,
        },
      }),
      this.prisma.booking.findMany({
        where: {
          profileId: profile.id,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
        },
        select: {
          studentId: true,
          amount: true,
          offeringId: true,
          offering: {
            select: {
              id: true,
              title: true,
              subcategory: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.booking.count({
        where: {
          profileId: profile.id,
          status: BookingStatus.CONFIRMED,
          slot: { endTime: { gte: now } },
        },
      }),
      this.prisma.booking.findMany({
        where: {
          profileId: profile.id,
          status: BookingStatus.CONFIRMED,
          slot: { endTime: { gte: now } },
        },
        orderBy: { slot: { startTime: 'asc' } },
        take: 4,
        select: {
          id: true,
          amount: true,
          status: true,
          durationMinutes: true,
          student: { select: { name: true, imageUrl: true } },
          offering: {
            select: {
              title: true,
              subcategory: { select: { name: true } },
            },
          },
          slot: { select: { startTime: true, endTime: true } },
        },
      }),
      this.prisma.booking.findMany({
        where: {
          profileId: profile.id,
          createdAt: { gte: startDate },
        },
        select: { createdAt: true },
      }),
    ]);

    // ─── Offerings Breakdown ──────────────────────────────────────────────
    const offeringMap = new Map<OfferingStatus, number>();
    let totalOfferings = 0;
    for (const row of offeringGroups) {
      offeringMap.set(row.status, row._count._all);
      totalOfferings += row._count._all;
    }

    // ─── Bookings Breakdown ───────────────────────────────────────────────
    const bookingMap = new Map<BookingStatus, number>();
    let totalBookings = 0;
    for (const row of bookingGroups) {
      bookingMap.set(row.status, row._count._all);
      totalBookings += row._count._all;
    }

    const completedCount = bookingMap.get(BookingStatus.COMPLETED) ?? 0;
    const cancelledCount = bookingMap.get(BookingStatus.CANCELLED) ?? 0;
    const finishedDenominator = completedCount + cancelledCount;
    const completionRate =
      finishedDenominator > 0 ? Math.round((completedCount / finishedDenominator) * 100) : 100;

    // ─── Earnings Metrics & Time Series ───────────────────────────────────
    let totalEarned = 0;
    let thisMonthEarned = 0;
    let inRangeEarned = 0;
    let totalRefunded = 0;
    let pendingEarnings = 0;
    let paidCount = 0;

    for (const payment of payments) {
      const amt = Number(payment.amount ?? 0);
      const effectiveDate = payment.paidAt ?? payment.createdAt;

      if (payment.status === PaymentStatus.SUCCEEDED) {
        totalEarned += amt;
        paidCount += 1;

        if (effectiveDate >= monthStart) {
          thisMonthEarned += amt;
        }
        if (effectiveDate >= startDate) {
          inRangeEarned += amt;
          const bucket = seriesMap.get(toDateKey(effectiveDate));
          if (bucket) {
            bucket.earnings += amt;
          }
        }
      } else if (
        payment.status === PaymentStatus.PENDING ||
        payment.status === PaymentStatus.PROCESSING
      ) {
        pendingEarnings += amt;
      } else if (
        payment.status === PaymentStatus.REFUNDED ||
        payment.status === PaymentStatus.PARTIALLY_REFUNDED
      ) {
        totalRefunded += Number(payment.refundAmount ?? amt);
      }
    }

    for (const b of bookingsInRange) {
      const bucket = seriesMap.get(toDateKey(b.createdAt));
      if (bucket) {
        bucket.bookings += 1;
      }
    }

    const avgSessionValue = paidCount > 0 ? Math.round(totalEarned / paidCount) : 0;

    // ─── Offering Performance & Unique Students ───────────────────────────
    const uniqueStudentIds = new Set<string>();
    const offeringPerfMap = new Map<
      string,
      {
        id: string;
        title: string;
        subcategoryName: string;
        bookingsCount: number;
        revenue: number;
      }
    >();

    for (const b of confirmedCompletedBookings) {
      uniqueStudentIds.add(b.studentId);
      const amount = Number(b.amount ?? 0);
      const existing = offeringPerfMap.get(b.offeringId) ?? {
        id: b.offeringId,
        title: b.offering?.title || b.offering?.subcategory?.name || 'Skill Session',
        subcategoryName: b.offering?.subcategory?.name ?? 'Creative Skill',
        bookingsCount: 0,
        revenue: 0,
      };
      existing.bookingsCount += 1;
      existing.revenue += amount;
      offeringPerfMap.set(b.offeringId, existing);
    }

    const offeringPerformance = Array.from(offeringPerfMap.values())
      .sort((a, b) => b.revenue - a.revenue || b.bookingsCount - a.bookingsCount)
      .slice(0, 6);

    return {
      range,
      earnings: {
        totalEarned,
        thisMonthEarned,
        inRangeEarned,
        totalRefunded,
        pendingEarnings,
        avgSessionValue,
      },
      sessions: {
        total: totalBookings,
        upcomingConfirmed: upcomingConfirmedCount,
        completed: completedCount,
        cancelled: cancelledCount,
        completionRate,
        uniqueStudents: uniqueStudentIds.size,
      },
      capacity: {
        openUpcomingSlots,
        activeWeeklyRules,
      },
      offerings: {
        total: totalOfferings,
        approved: offeringMap.get(OfferingStatus.APPROVED) ?? 0,
        pending: offeringMap.get(OfferingStatus.PENDING) ?? 0,
        needsAttention:
          (offeringMap.get(OfferingStatus.REJECTED) ?? 0) +
          (offeringMap.get(OfferingStatus.CHANGES_REQUESTED) ?? 0),
      },
      dailySeries: Array.from(seriesMap.values()),
      offeringPerformance,
      upcomingSessions: upcomingSessionsRecords.map((s) => ({
        id: s.id,
        studentName: s.student?.name ?? 'Student',
        studentImageUrl: s.student?.imageUrl ?? null,
        offeringTitle: s.offering?.title || s.offering?.subcategory?.name || 'Session',
        startTime: s.slot.startTime.toISOString(),
        endTime: s.slot.endTime.toISOString(),
        durationMinutes: s.durationMinutes,
        amount: Number(s.amount ?? 0),
        status: s.status,
      })),
    };
  }
}
