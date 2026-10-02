import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {IsEnum, IsInt, IsISO8601, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min,} from 'class-validator';
import { PaymentStatus } from '../../enums/payment.enum';

export class CreateCheckoutDto {
    @ApiProperty({ description: 'Booking ID to create checkout for', example: 'clxbooking001' })
    @IsString()
    @IsNotEmpty()
    bookingId!: string;
}

export class RefundPaymentDto {
    @ApiPropertyOptional({ description: 'Reason for refund', maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}

export class PaymentQueryDto {
    @ApiPropertyOptional({ enum: PaymentStatus })
    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus;

    @ApiPropertyOptional({ description: 'Filter by createdAt >= from (ISO)' })
    @IsOptional()
    @IsISO8601()
    from?: string;

    @ApiPropertyOptional({ description: 'Filter by createdAt <= to (ISO)' })
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
