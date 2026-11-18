import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
    @ApiProperty({ description: 'Booking ID being reviewed', example: 'clxbooking0001' })
    @IsString()
    @IsNotEmpty()
    bookingId!: string;

    @ApiProperty({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5, example: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    rating!: number;

    @ApiPropertyOptional({ description: 'Optional feedback note', maxLength: 1000, example: 'Excellent session, learned a lot!' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    comment?: string;
}

export class ReviewQueryDto {
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

    @ApiPropertyOptional({ description: 'Filter by specific star rating (1-5)', minimum: 1, maximum: 5 })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number;
}
