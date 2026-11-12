import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export type AnalyticsRange = '7d' | '30d' | '90d';

export class AdminAnalyticsQueryDto {
  @ApiPropertyOptional({
    enum: ['7d', '30d', '90d'],
    default: '30d',
    description: 'Time window for trend charts and range-scoped metrics',
  })
  @IsOptional()
  @IsIn(['7d', '30d', '90d'])
  range?: AnalyticsRange;
}

