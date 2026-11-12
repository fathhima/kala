import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminUserMetricsDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  students!: number;

  @ApiProperty()
  instructors!: number;

  @ApiProperty()
  active!: number;

  @ApiProperty()
  blocked!: number;

  @ApiProperty()
  newInRange!: number;
}

export class AdminApplicationMetricsDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  pending!: number;

  @ApiProperty()
  approved!: number;

  @ApiProperty()
  rejected!: number;

  @ApiProperty()
  changesRequested!: number;
}

export class AdminBookingMetricsDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  confirmed!: number;

  @ApiProperty()
  completed!: number;

  @ApiProperty()
  paymentPending!: number;

  @ApiProperty()
  cancelled!: number;

  @ApiProperty()
  expired!: number;

  @ApiProperty()
  refunded!: number;

  @ApiProperty()
  newInRange!: number;
}

export class AdminRevenueMetricsDto {
  @ApiProperty()
  grossVolume!: number;

  @ApiProperty()
  netRevenue!: number;

  @ApiProperty()
  refundedAmount!: number;

  @ApiProperty()
  inRangeVolume!: number;

  @ApiProperty()
  succeededPayments!: number;

  @ApiProperty()
  failedPayments!: number;

  @ApiProperty()
  avgBookingValue!: number;
}

export class AdminCatalogMetricsDto {
  @ApiProperty()
  activeCategories!: number;

  @ApiProperty()
  activeSubcategories!: number;

  @ApiProperty()
  approvedOfferings!: number;
}

export class AdminDailyPointDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  revenue!: number;

  @ApiProperty()
  bookings!: number;

  @ApiProperty()
  newUsers!: number;
}

export class AdminStatusBreakdownDto {
  @ApiProperty()
  status!: string;

  @ApiProperty()
  count!: number;

  @ApiPropertyOptional()
  amount?: number;
}

export class AdminCategoryPerformanceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  bookingsCount!: number;

  @ApiProperty()
  revenue!: number;
}

export class AdminTopInstructorDto {
  @ApiProperty()
  profileId!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  imageUrl!: string | null;

  @ApiProperty()
  bookingsCount!: number;

  @ApiProperty()
  revenue!: number;
}

export class AdminPendingApplicationItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  instructorName!: string;

  @ApiProperty()
  instructorEmail!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  offeringsCount!: number;

  @ApiProperty()
  submittedAt!: string;
}

export class AdminRecentBookingItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  studentName!: string;

  @ApiProperty()
  instructorName!: string;

  @ApiProperty()
  offeringTitle!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: string;
}

export class AdminAnalyticsDataDto {
  @ApiProperty()
  range!: '7d' | '30d' | '90d';

  @ApiProperty({ type: AdminUserMetricsDto })
  users!: AdminUserMetricsDto;

  @ApiProperty({ type: AdminApplicationMetricsDto })
  applications!: AdminApplicationMetricsDto;

  @ApiProperty({ type: AdminBookingMetricsDto })
  bookings!: AdminBookingMetricsDto;

  @ApiProperty({ type: AdminRevenueMetricsDto })
  revenue!: AdminRevenueMetricsDto;

  @ApiProperty({ type: AdminCatalogMetricsDto })
  catalog!: AdminCatalogMetricsDto;

  @ApiProperty({ type: [AdminDailyPointDto] })
  dailySeries!: AdminDailyPointDto[];

  @ApiProperty({ type: [AdminStatusBreakdownDto] })
  bookingStatusBreakdown!: AdminStatusBreakdownDto[];

  @ApiProperty({ type: [AdminStatusBreakdownDto] })
  paymentStatusBreakdown!: AdminStatusBreakdownDto[];

  @ApiProperty({ type: [AdminCategoryPerformanceDto] })
  topCategories!: AdminCategoryPerformanceDto[];

  @ApiProperty({ type: [AdminTopInstructorDto] })
  topInstructors!: AdminTopInstructorDto[];

  @ApiProperty({ type: [AdminPendingApplicationItemDto] })
  pendingApplications!: AdminPendingApplicationItemDto[];

  @ApiProperty({ type: [AdminRecentBookingItemDto] })
  recentBookings!: AdminRecentBookingItemDto[];
}

export class AdminAnalyticsResponseDto {
  @ApiProperty({ example: 'Admin analytics fetched successfully' })
  message!: string;

  @ApiProperty({ type: AdminAnalyticsDataDto })
  data!: AdminAnalyticsDataDto;
}

