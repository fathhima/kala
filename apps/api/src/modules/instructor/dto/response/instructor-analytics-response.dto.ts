import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InstructorEarningsMetricsDto {
  @ApiProperty()
  totalEarned!: number;

  @ApiProperty()
  thisMonthEarned!: number;

  @ApiProperty()
  inRangeEarned!: number;

  @ApiProperty()
  totalRefunded!: number;

  @ApiProperty()
  pendingEarnings!: number;

  @ApiProperty()
  avgSessionValue!: number;
}

export class InstructorSessionMetricsDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  upcomingConfirmed!: number;

  @ApiProperty()
  completed!: number;

  @ApiProperty()
  cancelled!: number;

  @ApiProperty()
  completionRate!: number;

  @ApiProperty()
  uniqueStudents!: number;
}

export class InstructorCapacityMetricsDto {
  @ApiProperty()
  openUpcomingSlots!: number;

  @ApiProperty()
  activeWeeklyRules!: number;
}

export class InstructorOfferingStatsDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  approved!: number;

  @ApiProperty()
  pending!: number;

  @ApiProperty()
  needsAttention!: number;
}

export class InstructorDailyPointDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  earnings!: number;

  @ApiProperty()
  bookings!: number;
}

export class InstructorOfferingPerformanceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  subcategoryName!: string;

  @ApiProperty()
  bookingsCount!: number;

  @ApiProperty()
  revenue!: number;
}

export class InstructorUpcomingSessionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  studentName!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  studentImageUrl!: string | null;

  @ApiProperty()
  offeringTitle!: string;

  @ApiProperty()
  startTime!: string;

  @ApiProperty()
  endTime!: string;

  @ApiProperty()
  durationMinutes!: number;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  status!: string;
}

export class InstructorAnalyticsDataDto {
  @ApiProperty()
  range!: '7d' | '30d' | '90d';

  @ApiProperty({ type: InstructorEarningsMetricsDto })
  earnings!: InstructorEarningsMetricsDto;

  @ApiProperty({ type: InstructorSessionMetricsDto })
  sessions!: InstructorSessionMetricsDto;

  @ApiProperty({ type: InstructorCapacityMetricsDto })
  capacity!: InstructorCapacityMetricsDto;

  @ApiProperty({ type: InstructorOfferingStatsDto })
  offerings!: InstructorOfferingStatsDto;

  @ApiProperty({ type: [InstructorDailyPointDto] })
  dailySeries!: InstructorDailyPointDto[];

  @ApiProperty({ type: [InstructorOfferingPerformanceDto] })
  offeringPerformance!: InstructorOfferingPerformanceDto[];

  @ApiProperty({ type: [InstructorUpcomingSessionDto] })
  upcomingSessions!: InstructorUpcomingSessionDto[];
}

export class InstructorAnalyticsResponseDto {
  @ApiProperty({ example: 'Instructor analytics fetched successfully' })
  message!: string;

  @ApiProperty({ type: InstructorAnalyticsDataDto })
  data!: InstructorAnalyticsDataDto;
}

