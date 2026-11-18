import {
    InstructorReviewSummaryEntity,
    PaginatedReviewEntity,
    ReviewEntity,
} from '../../entities/review.entity';
import { CreateReviewInput, ReviewListQuery } from '../../types/review.type';

export const REVIEW_REPOSITORY = Symbol('REVIEW_REPOSITORY');

export interface IReviewRepository {
    create(input: CreateReviewInput): Promise<ReviewEntity>;
    findById(id: string): Promise<ReviewEntity | null>;
    findByBookingId(bookingId: string): Promise<ReviewEntity | null>;
    findInstructorReviews(profileId: string, query: ReviewListQuery): Promise<PaginatedReviewEntity>;
    getInstructorSummary(profileId: string): Promise<InstructorReviewSummaryEntity>;
}
