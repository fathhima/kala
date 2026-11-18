import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserId } from '@/shared/decorators/user-id.decorator';
import { Public } from '@/shared/decorators/public.decorator';
import { UserRole } from '@/shared/enums/role.enum';
import { REVIEW_SERVICE, type IReviewService } from './services/interfaces/review.service.interface';
import { CreateReviewDto, ReviewQueryDto } from './dto/request/review.request.dto';
import {
    InstructorReviewSummaryResponseDto,
    PaginatedReviewsResponseDto,
    ReviewResponseDto,
} from './dto/response/review-response.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
    constructor(
        @Inject(REVIEW_SERVICE)
        private readonly _reviewService: IReviewService,
    ) { }

    @Post()
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'Submit a review for a completed booking' })
    @ApiCreatedResponse({ type: ReviewResponseDto })
    async create(
        @UserId() studentId: string,
        @Body() dto: CreateReviewDto,
    ): Promise<ReviewResponseDto> {
        return this._reviewService.create(studentId, dto);
    }

    @Get('booking/:bookingId')
    @Roles(UserRole.STUDENT, UserRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Get review for a specific booking' })
    @ApiOkResponse({ type: ReviewResponseDto })
    async getByBookingId(
        @UserId() userId: string,
        @Param('bookingId') bookingId: string,
    ): Promise<ReviewResponseDto> {
        return this._reviewService.getByBookingId(userId, bookingId);
    }

    @Get('my-reviews')
    @Roles(UserRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Get reviews for the logged-in instructor' })
    @ApiOkResponse({ type: PaginatedReviewsResponseDto })
    async getMyReviews(
        @UserId() instructorUserId: string,
        @Query() query: ReviewQueryDto,
    ): Promise<PaginatedReviewsResponseDto> {
        return this._reviewService.getMyReviews(instructorUserId, query);
    }

    @Public()
    @Get('instructor/:profileId')
    @ApiOperation({ summary: 'Get reviews for an instructor profile' })
    @ApiOkResponse({ type: PaginatedReviewsResponseDto })
    async getInstructorReviews(
        @Param('profileId') profileId: string,
        @Query() query: ReviewQueryDto,
    ): Promise<PaginatedReviewsResponseDto> {
        return this._reviewService.getInstructorReviews(profileId, query);
    }

    @Public()
    @Get('instructor/:profileId/summary')
    @ApiOperation({ summary: 'Get review summary (average & distribution) for an instructor' })
    @ApiOkResponse({ type: InstructorReviewSummaryResponseDto })
    async getInstructorSummary(
        @Param('profileId') profileId: string,
    ): Promise<InstructorReviewSummaryResponseDto> {
        return this._reviewService.getInstructorSummary(profileId);
    }
}
