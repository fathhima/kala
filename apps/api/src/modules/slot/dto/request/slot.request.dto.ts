import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { AvailabilityExceptionType } from '@prisma/client';

export class CreateSlotRuleDto {
  @ApiProperty()
  @IsString()
  offeringId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @ApiProperty({ example: 1, description: '0 = Sunday, 1 = Monday' })
  @IsInt()
  @Min(0)
  @Max(6)
  weekday!: number;

  @ApiProperty({ example: 600 })
  @IsInt()
  @Min(0)
  @Max(1439)
  startMinute!: number;

  @ApiProperty({ example: 780 })
  @IsInt()
  @Min(1)
  @Max(1440)
  endMinute!: number;

  @ApiProperty({ example: 60 })
  @IsInt()
  @Min(15)
  @Max(480)
  slotDurationMinutes!: number;

  @ApiPropertyOptional({ default: 'Asia/Kolkata' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @ApiProperty()
  @IsDateString()
  effectiveFrom!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveUntil?: string;
}

export class UpdateSlotRuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1439)
  startMinute?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  endMinute?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  slotDurationMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveUntil?: string;
}

export class CreateSlotExceptionDto {
  @ApiProperty({ enum: AvailabilityExceptionType })
  @IsEnum(AvailabilityExceptionType)
  type!: AvailabilityExceptionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  offeringId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @ApiProperty()
  @IsDateString()
  startTime!: string;

  @ApiProperty()
  @IsDateString()
  endTime!: string;

  @ApiPropertyOptional({ default: 'Asia/Kolkata' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  slotDurationMinutes?: number;
}

export class SlotAvailabilityQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  offeringId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;
}