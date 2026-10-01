import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserId } from '@/shared/decorators/user-id.decorator';
import { UserRole } from '@/shared/enums/role.enum';
import { BOOKING_SERVICE, type IBookingService } from './services/interfaces/booking.service.interface';
import { BookingQueryDto, CancelBookingDto, CreateBookingDto } from './dto/request/booking.request.dto';
import { BookingResponseDto, PaginatedBookingsResponseDto } from './dto/response/booking-response.dto';
import { BookingListQuery } from './types/booking.type';
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
    async hold(@UserId() userId: string, @Body() dto: CreateBookingDto) {
        const booking = await this._bookingService.hold(userId, dto.slotId);

        return BookingResponseDto.fromEntity('Slot held successfully. Complete payment to confirm.', booking);
    }

    @Get('bookings')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'List current student bookings' })
    @ApiOkResponse({ type: PaginatedBookingsResponseDto })
    async listStudent(@UserId() userId: string, @Query() query: BookingQueryDto) {
        const bookings = await this._bookingService.listStudent(userId, this._toListQuery(query));

        return PaginatedBookingsResponseDto.fromEntity('Bookings fetched successfully', bookings);
    }

    @Get('bookings/:bookingId')
    @ApiOperation({ summary: 'Get a booking by id (student, instructor, or admin)' })
    @ApiOkResponse({ type: BookingResponseDto })
    async getById(@UserId() userId: string, @UserRoles() roles: UserRole | UserRole[], @Param('bookingId') bookingId: string,) {
        const booking = await this._bookingService.getById(userId, this._asRoleList(roles), bookingId);

        return BookingResponseDto.fromEntity('Booking fetched successfully', booking);
    }

    @Post('bookings/:bookingId/cancel')
    @ApiOperation({ summary: 'Cancel a pending hold or confirmed session and release the slot' })
    @ApiOkResponse({ type: BookingResponseDto })
    async cancel(@UserId() userId: string, @UserRoles() roles: UserRole | UserRole[], @Param('bookingId') bookingId: string, @Body() dto: CancelBookingDto,) {
        const booking = await this._bookingService.cancel(userId, this._asRoleList(roles), bookingId, dto.reason,);

        return BookingResponseDto.fromEntity('Booking cancelled successfully', booking);
    }

    @Get('instructor/bookings')
    @Roles(UserRole.INSTRUCTOR)
    @ApiTags('Instructor Bookings')
    @ApiOperation({ summary: 'List bookings for the current instructor' })
    @ApiOkResponse({ type: PaginatedBookingsResponseDto })
    async listInstructor(@UserId() userId: string, @Query() query: BookingQueryDto) {
        const bookings = await this._bookingService.listInstructor(userId, this._toListQuery(query));

        return PaginatedBookingsResponseDto.fromEntity('Instructor bookings fetched successfully', bookings);
    }

    @Post('instructor/bookings/:bookingId/complete')
    @Roles(UserRole.INSTRUCTOR)
    @ApiTags('Instructor Bookings')
    @ApiOperation({ summary: 'Mark a confirmed session as completed after it ends' })
    @ApiOkResponse({ type: BookingResponseDto })
    async complete(@UserId() userId: string, @Param('bookingId') bookingId: string) {
        const booking = await this._bookingService.complete(userId, bookingId);

        return BookingResponseDto.fromEntity('Session marked as completed', booking);
    }

    @Get('admin/bookings')
    @Roles(UserRole.ADMIN)
    @ApiTags('Admin Bookings')
    @ApiOperation({ summary: 'List all bookings' })
    @ApiOkResponse({ type: PaginatedBookingsResponseDto })
    async listAdmin(@Query() query: BookingQueryDto) {
        const bookings = await this._bookingService.listAdmin(this._toListQuery(query));

        return PaginatedBookingsResponseDto.fromEntity('Bookings fetched successfully', bookings);
    }

    private _toListQuery(query: BookingQueryDto): BookingListQuery {
        return {
            status: query.status,
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
            page: query.page ?? 1,
            limit: query.limit ?? 20,
        };
    }

    private _asRoleList(roles: UserRole | UserRole[]): UserRole[] {
        return Array.isArray(roles) ? roles : [roles];
    }
}