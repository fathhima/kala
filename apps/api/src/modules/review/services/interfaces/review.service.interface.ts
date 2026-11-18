import { CreateReviewDto, ReviewQueryDto } from '../../dto/request/review.request.dto';
import {
    InstructorReviewSummaryResponseDto,
    PaginatedReviewsResponseDto,
    ReviewResponseDto,
} from '../../dto/response/review-response.dto';

export const REVIEW_SERVICE = Symbol('REVIEW_SERVICE');

export interface IReviewService {
    create(studentId: string, dto: CreateReviewDto): Promise<ReviewResponseDto>;
    getByBookingId(studentId: string, bookingId: string): Promise<ReviewResponseDto>;
    getInstructorReviews(profileId: string, query: ReviewQueryDto): Promise<PaginatedReviewsResponseDto>;
    getMyReviews(instructorUserId: string, query: ReviewQueryDto): Promise<PaginatedReviewsResponseDto>;
    getInstructorSummary(profileId: string): Promise<InstructorReviewSummaryResponseDto>;
}
