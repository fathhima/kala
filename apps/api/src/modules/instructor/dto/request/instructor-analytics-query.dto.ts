import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export type InstructorAnalyticsRange = '7d' | '30d' | '90d';

export class InstructorAnalyticsQueryDto {
  @ApiPropertyOptional({
    enum: ['7d', '30d', '90d'],
    default: '30d',
  })
  @IsOptional()
  @IsIn(['7d', '30d', '90d'])
  range?: InstructorAnalyticsRange;
}

