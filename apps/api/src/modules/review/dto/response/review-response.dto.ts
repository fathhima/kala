import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    InstructorReviewSummaryEntity,
    PaginatedReviewEntity,
    ReviewEntity,
} from '../../entities/review.entity';

export class ReviewStudentDto {
    @ApiProperty({ example: 'clxstudent0001' })
    id!: string;

    @ApiProperty({ example: 'Jane Doe' })
    name!: string;

    @ApiPropertyOptional({ nullable: true, example: 'https://example.com/avatar.jpg' })
    imageUrl!: string | null;
}

export class ReviewDto {
    @ApiProperty({ example: 'clxreview0001' })
    id!: string;

    @ApiProperty({ example: 'clxbooking0001' })
    bookingId!: string;

    @ApiProperty({ example: 'clxstudent0001' })
    studentId!: string;

    @ApiProperty({ example: 'clxprofile0001' })
    profileId!: string;

    @ApiProperty({ example: 5 })
    rating!: number;

    @ApiPropertyOptional({ nullable: true, example: 'Great session!' })
    comment!: string | null;

    @ApiProperty({ example: '2026-11-18T10:00:00.000Z' })
    createdAt!: string;

    @ApiProperty({ example: '2026-11-18T10:00:00.000Z' })
    updatedAt!: string;

    @ApiProperty({ type: ReviewStudentDto })
    student!: ReviewStudentDto;

    static fromEntity(entity: ReviewEntity): ReviewDto {
        const dto = new ReviewDto();
        dto.id = entity.id;
        dto.bookingId = entity.bookingId;
        dto.studentId = entity.studentId;
        dto.profileId = entity.profileId;
        dto.rating = entity.rating;
        dto.comment = entity.comment;
        dto.createdAt = entity.createdAt.toISOString();
        dto.updatedAt = entity.updatedAt.toISOString();
        dto.student = {
            id: entity.student.id,
            name: entity.student.name,
            imageUrl: entity.student.imageUrl,
        };
        return dto;
    }
}

export class ReviewResponseDto {
    @ApiProperty({ example: 'Review submitted successfully' })
    message!: string;

    @ApiProperty({ type: ReviewDto })
    data!: ReviewDto;

    static fromEntity(message: string, entity: ReviewEntity): ReviewResponseDto {
        const dto = new ReviewResponseDto();
        dto.message = message;
        dto.data = ReviewDto.fromEntity(entity);
        return dto;
    }
}

export class ReviewPaginationMetaDto {
    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 20 })
    limit!: number;

    @ApiProperty({ example: 45 })
    total!: number;

    @ApiProperty({ example: 3 })
    totalPages!: number;
}

export class ReviewDistributionDto {
    @ApiProperty({ example: 10 })
    5!: number;

    @ApiProperty({ example: 4 })
    4!: number;

    @ApiProperty({ example: 1 })
    3!: number;

    @ApiProperty({ example: 0 })
    2!: number;

    @ApiProperty({ example: 0 })
    1!: number;
}

export class InstructorReviewSummaryDto {
    @ApiProperty({ example: 4.8 })
    averageRating!: number;

    @ApiProperty({ example: 15 })
    totalReviews!: number;

    @ApiProperty({ type: ReviewDistributionDto })
    distribution!: ReviewDistributionDto;

    static fromEntity(entity: InstructorReviewSummaryEntity): InstructorReviewSummaryDto {
        const dto = new InstructorReviewSummaryDto();
        dto.averageRating = entity.averageRating;
        dto.totalReviews = entity.totalReviews;
        dto.distribution = {
            5: entity.distribution[5],
            4: entity.distribution[4],
            3: entity.distribution[3],
            2: entity.distribution[2],
            1: entity.distribution[1],
        };
        return dto;
    }
}

export class InstructorReviewSummaryResponseDto {
    @ApiProperty({ example: 'Review summary fetched successfully' })
    message!: string;

    @ApiProperty({ type: InstructorReviewSummaryDto })
    data!: InstructorReviewSummaryDto;

    static fromEntity(message: string, entity: InstructorReviewSummaryEntity): InstructorReviewSummaryResponseDto {
        const dto = new InstructorReviewSummaryResponseDto();
        dto.message = message;
        dto.data = InstructorReviewSummaryDto.fromEntity(entity);
        return dto;
    }
}

export class PaginatedReviewsDataDto {
    @ApiProperty({ type: [ReviewDto] })
    items!: ReviewDto[];

    @ApiProperty({ type: ReviewPaginationMetaDto })
    meta!: ReviewPaginationMetaDto;

    @ApiPropertyOptional({ type: InstructorReviewSummaryDto })
    summary?: InstructorReviewSummaryDto;
}

export class PaginatedReviewsResponseDto {
    @ApiProperty({ example: 'Reviews fetched successfully' })
    message!: string;

    @ApiProperty({ type: PaginatedReviewsDataDto })
    data!: PaginatedReviewsDataDto;

    static fromEntity(
        message: string,
        entity: PaginatedReviewEntity,
        summary?: InstructorReviewSummaryEntity,
    ): PaginatedReviewsResponseDto {
        const dto = new PaginatedReviewsResponseDto();
        dto.message = message;
        dto.data = {
            items: entity.items.map(ReviewDto.fromEntity),
            meta: {
                page: entity.page,
                limit: entity.limit,
                total: entity.total,
                totalPages: Math.ceil(entity.total / entity.limit) || 0,
            },
            summary: summary ? InstructorReviewSummaryDto.fromEntity(summary) : undefined,
        };
        return dto;
    }
}
