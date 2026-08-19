import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { SlotStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class SlotInputDto {
  @ApiProperty({ example: '2026-08-25T04:30:00.000Z' })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ example: '2026-08-25T05:30:00.000Z' })
  @IsDateString()
  endTime!: string;

  @ApiPropertyOptional({ example: 'Morning session' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;
}

export class CreateSlotsDto {
  @ApiProperty()
  @IsString()
  offeringId!: string;

  @ApiPropertyOptional({ default: 'Asia/Kolkata' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @ApiProperty({ type: [SlotInputDto] })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => SlotInputDto)
  slots!: SlotInputDto[];
}

export class UpdateSlotDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;
}

export class InstructorSlotQueryDto {
  @ApiPropertyOptional({ enum: SlotStatus })
  @IsOptional()
  @IsEnum(SlotStatus)
  status?: SlotStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class PublicAvailabilityQueryDto {
  @ApiProperty()
  @IsString()
  offeringId!: string;

  @ApiProperty({ example: '2026-08-25' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;
}