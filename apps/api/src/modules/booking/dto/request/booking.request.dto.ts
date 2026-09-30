import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsISO8601, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, } from 'class-validator';
import { BookingStatus } from '../../enums/booking.enum';

export class CreateBookingDto {
    @ApiProperty({ description: 'Availability slot to hold', example: 'clxslot0001' })
    @IsString()
    @IsNotEmpty()
    slotId!: string;
}

export class CancelBookingDto {
    @ApiPropertyOptional({ description: 'Optional cancel reason', maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}

export class BookingQueryDto {
    @ApiPropertyOptional({ enum: BookingStatus })
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @ApiPropertyOptional({ description: 'Filter by slot startTime >= from (ISO)' })
    @IsOptional()
    @IsISO8601()
    from?: string;

    @ApiPropertyOptional({ description: 'Filter by slot startTime <= to (ISO)' })
    @IsOptional()
    @IsISO8601()
    to?: string;

    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 50 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 20;
}