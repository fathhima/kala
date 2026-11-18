import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { IReviewService } from './interfaces/review.service.interface';
import {
    type IReviewRepository,
    REVIEW_REPOSITORY,
} from '../repositories/interfaces/review.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CreateReviewDto, ReviewQueryDto } from '../dto/request/review.request.dto';
import {
    InstructorReviewSummaryResponseDto,
    PaginatedReviewsResponseDto,
    ReviewResponseDto,
} from '../dto/response/review-response.dto';
import { BookingStatus } from '@/modules/booking/enums/booking.enum';
import {
    type ILoggerService,
    LOGGER_SERVICE,
} from '@/shared/logger/repositories/interfaces/logger.interface';

@Injectable()
export class ReviewService implements IReviewService {
    constructor(
        @Inject(REVIEW_REPOSITORY)
        private readonly _reviewRepository: IReviewRepository,
        private readonly _prisma: PrismaService,
        @Inject(LOGGER_SERVICE)
        private readonly _logger: ILoggerService,
    ) { }

    async create(studentId: string, dto: CreateReviewDto): Promise<ReviewResponseDto> {
        this._logger.log('Submitting review for booking', 'ReviewService', {
            bookingId: dto.bookingId,
            studentId,
            rating: dto.rating,
        });

        // 1. Verify booking exists
        const booking = await this._prisma.booking.findUnique({
            where: { id: dto.bookingId },
            select: {
                id: true,
                studentId: true,
                profileId: true,
                status: true,
            },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        // 2. Enforce student ownership
        if (booking.studentId !== studentId) {
            throw new ForbiddenException('You can only review sessions you booked and attended');
        }

        // 3. Verify session was completed
        if (booking.status !== BookingStatus.COMPLETED) {
            throw new BadRequestException('Only completed sessions can be reviewed');
        }

        // 4. Verify no review already exists
        const existing = await this._reviewRepository.findByBookingId(dto.bookingId);
        if (existing) {
            throw new ConflictException('A review has already been submitted for this session');
        }

        // 5. Persist review
        const entity = await this._reviewRepository.create({
            bookingId: dto.bookingId,
            studentId,
            profileId: booking.profileId,
            rating: dto.rating,
            comment: dto.comment?.trim() || undefined,
        });

        this._logger.log('Review submitted successfully', 'ReviewService', {
            reviewId: entity.id,
            bookingId: dto.bookingId,
        });

        return ReviewResponseDto.fromEntity('Review submitted successfully', entity);
    }

    async getByBookingId(_studentId: string, bookingId: string): Promise<ReviewResponseDto> {
        const review = await this._reviewRepository.findByBookingId(bookingId);
        if (!review) {
            throw new NotFoundException('No review found for this booking');
        }

        return ReviewResponseDto.fromEntity('Review fetched successfully', review);
    }

    async getInstructorReviews(
        profileId: string,
        query: ReviewQueryDto,
    ): Promise<PaginatedReviewsResponseDto> {
        const [paginated, summary] = await Promise.all([
            this._reviewRepository.findInstructorReviews(profileId, {
                page: query.page ?? 1,
                limit: query.limit ?? 20,
                rating: query.rating,
            }),
            this._reviewRepository.getInstructorSummary(profileId),
        ]);

        return PaginatedReviewsResponseDto.fromEntity('Reviews fetched successfully', paginated, summary);
    }

    async getMyReviews(
        instructorUserId: string,
        query: ReviewQueryDto,
    ): Promise<PaginatedReviewsResponseDto> {
        const profile = await this._prisma.instructorProfile.findUnique({
            where: { userId: instructorUserId },
            select: { id: true },
        });

        if (!profile) {
            throw new NotFoundException('Instructor profile not found');
        }

        return this.getInstructorReviews(profile.id, query);
    }

    async getInstructorSummary(profileId: string): Promise<InstructorReviewSummaryResponseDto> {
        const summary = await this._reviewRepository.getInstructorSummary(profileId);
        return InstructorReviewSummaryResponseDto.fromEntity('Review summary fetched successfully', summary);
    }
}
