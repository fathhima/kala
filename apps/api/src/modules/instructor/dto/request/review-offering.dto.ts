import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ReviewableOfferingStatus } from '../../types/offering-status.type';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const REVIEWABLE_OFFERING_STATUSES = ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED',] as const;

export class ReviewOfferingDto {
    @ApiProperty({
        enum: REVIEWABLE_OFFERING_STATUSES,
    })
    @IsIn(REVIEWABLE_OFFERING_STATUSES)
    decision!: ReviewableOfferingStatus;

    @ApiPropertyOptional({ maxLength: 2_000 })
    @IsOptional()
    @IsString()
    @MaxLength(2_000)
    reviewNote?: string;
}