import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { BasePrismaRepository } from '@/shared/prisma/base';
import { IReviewRepository } from './interfaces/review.interface';
import {
    InstructorReviewSummaryEntity,
    PaginatedReviewEntity,
    ReviewEntity,
} from '../entities/review.entity';
import { CreateReviewInput, ReviewListQuery } from '../types/review.type';
import { ReviewMapper, reviewInclude } from '../mappers/review.mapper';

@Injectable()
export class PrismaReviewRepository extends BasePrismaRepository implements IReviewRepository {
    constructor(prisma: PrismaService) {
        super(prisma);
    }

    async create(input: CreateReviewInput): Promise<ReviewEntity> {
        const record = await (this.prisma as any).review.create({
            data: {
                bookingId: input.bookingId,
                studentId: input.studentId,
                profileId: input.profileId,
                rating: input.rating,
                comment: input.comment ?? null,
            },
            include: reviewInclude,
        });

        return ReviewMapper.toEntity(record);
    }

    async findById(id: string): Promise<ReviewEntity | null> {
        const record = await (this.prisma as any).review.findUnique({
            where: { id },
            include: reviewInclude,
        });

        return record ? ReviewMapper.toEntity(record) : null;
    }

    async findByBookingId(bookingId: string): Promise<ReviewEntity | null> {
        const record = await (this.prisma as any).review.findUnique({
            where: { bookingId },
            include: reviewInclude,
        });

        return record ? ReviewMapper.toEntity(record) : null;
    }

    async findInstructorReviews(
        profileId: string,
        query: ReviewListQuery,
    ): Promise<PaginatedReviewEntity> {
        const where: any = {
            profileId,
            ...(query.rating ? { rating: query.rating } : {}),
        };

        const page = Math.max(1, query.page);
        const limit = Math.max(1, Math.min(50, query.limit));
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            (this.prisma as any).review.findMany({
                where,
                include: reviewInclude,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            (this.prisma as any).review.count({ where }),
        ]);

        return {
            items: items.map(ReviewMapper.toEntity),
            page,
            limit,
            total,
        };
    }

    async getInstructorSummary(profileId: string): Promise<InstructorReviewSummaryEntity> {
        const reviews = await (this.prisma as any).review.findMany({
            where: { profileId },
            select: { rating: true },
        });

        const totalReviews = reviews.length;
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        if (totalReviews === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                distribution,
            };
        }

        let sum = 0;
        for (const r of reviews) {
            sum += r.rating;
            if (r.rating in distribution) {
                distribution[r.rating as keyof typeof distribution] += 1;
            }
        }

        const averageRating = Math.round((sum / totalReviews) * 10) / 10;

        return {
            averageRating,
            totalReviews,
            distribution,
        };
    }
}
