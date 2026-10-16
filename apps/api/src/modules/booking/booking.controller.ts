import { Body, Controller, Get, Inject, Param, Post, Query, Headers } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserId } from '@/shared/decorators/user-id.decorator';
import { UserRole } from '@/shared/enums/role.enum';
import { BOOKING_SERVICE, type IBookingService } from './services/interfaces/booking.service.interface';
import { BookingQueryDto, CancelBookingDto, CreateBookingDto } from './dto/request/booking.request.dto';
import { BookingResponseDto, PaginatedBookingsResponseDto } from './dto/response/booking-response.dto';
import { UserRoles } from '@/shared/decorators/user-role.decorator';

@ApiTags('Bookings')
@Controller()
export class BookingController {
    constructor(
        @Inject(BOOKING_SERVICE)
        private readonly _bookingService: IBookingService,
    ) { }

    @Post('bookings')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'Hold a slot for 10 minutes pending payment' })
    @ApiCreatedResponse({ type: BookingResponseDto })
    async hold(
        @UserId() userId: string,
        @Body() dto: CreateBookingDto,
        @Headers('idempotency-key') idempotencyKey?: string,
    ): Promise<BookingResponseDto> {
        return this._bookingService.hold(userId, dto, idempotencyKey);
    }

    @Get('bookings')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'List current student bookings' })
    @ApiOkResponse({ type: PaginatedBookingsResponseDto })
    async listStudent(
        @UserId() userId: string,
        @Query() query: BookingQueryDto,
    ): Promise<PaginatedBookingsResponseDto> {
        return this._bookingService.listStudent(userId, query);
    }

    @Get('bookings/:bookingId')
    @ApiOperation({ summary: 'Get a booking by id (student, instructor, or admin)' })
    @ApiOkResponse({ type: BookingResponseDto })
    async getById(
        @UserId() userId: string,
        @UserRoles() roles: UserRole | UserRole[],
        @Param('bookingId') bookingId: string,
    ): Promise<BookingResponseDto> {
        return this._bookingService.getById(userId, roles, bookingId);
    }

    @Post('bookings/:bookingId/cancel')
    @ApiOperation({ summary: 'Cancel a pending hold or confirmed session and release the slot' })
    @ApiOkResponse({ type: BookingResponseDto })
    async cancel(
        @UserId() userId: string,
        @UserRoles() roles: UserRole | UserRole[],
        @Param('bookingId') bookingId: string,
        @Body() dto: CancelBookingDto,
    ): Promise<BookingResponseDto> {
        return this._bookingService.cancel(userId, roles, bookingId, dto);
    }

    @Get('instructor/bookings')
    @Roles(UserRole.INSTRUCTOR)
    @ApiOperation({ summary: 'List bookings for the current instructor' })
    @ApiOkResponse({ type: PaginatedBookingsResponseDto })
    async listInstructor(
        @UserId() userId: string,
        @Query() query: BookingQueryDto,
    ): Promise<PaginatedBookingsResponseDto> {
        return this._bookingService.listInstructor(userId, query);
    }

    @Post('instructor/bookings/:bookingId/complete')
    @Roles(UserRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Mark a confirmed session as completed after it ends' })
    @ApiOkResponse({ type: BookingResponseDto })
    async complete(
        @UserId() userId: string,
        @Param('bookingId') bookingId: string,
    ): Promise<BookingResponseDto> {
        return this._bookingService.complete(userId, bookingId);
    }

    @Get('admin/bookings')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'List all bookings' })
    @ApiOkResponse({ type: PaginatedBookingsResponseDto })
    async listAdmin(
        @Query() query: BookingQueryDto,
    ): Promise<PaginatedBookingsResponseDto> {
        return this._bookingService.listAdmin(query);
    }
}