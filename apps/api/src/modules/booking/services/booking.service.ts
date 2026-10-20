import {
    BadRequestException, ConflictException, Inject, Injectable, NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IBookingService } from './interfaces/booking.service.interface';
import { BOOKING_REPOSITORY, type IBookingRepository } from '../repositories/interfaces/booking.interface';
import { BookingEntity, PaginatedBookingEntity } from '../entities/booking.entity';
import { BookingListQuery } from '../types/booking.type';
import { UserRole } from '@/shared/enums/role.enum';
import { type ILoggerService, LOGGER_SERVICE } from '@/shared/logger/repositories/interfaces/logger.interface';
import { BookingStatus } from '../enums/booking.enum';
import { BookingConflictError, BookingNotFoundError, BookingValidationError, SlotNotFoundError } from '../errors/booking.errors';
import { BookingCancelledEvent } from '../events/booking-cancelled.event';
import { calculateRefundEligibility } from '../utils/refund-policy';
import { BookingQueryDto, CancelBookingDto, CreateBookingDto } from '../dto/request/booking.request.dto';
import { BookingForPaymentDto, BookingResponseDto, PaginatedBookingsResponseDto } from '../dto/response/booking-response.dto';

@Injectable()
export class BookingService implements IBookingService {
    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly _bookingRepository: IBookingRepository,
        private readonly _configService: ConfigService,
        @Inject(LOGGER_SERVICE)
        private readonly _logger: ILoggerService,
        private readonly _eventEmitter: EventEmitter2,
    ) { }


    async hold(studentId: string, dto: CreateBookingDto, idempotencyKey?: string): Promise<BookingResponseDto> {
        const ttl = this._configService.getOrThrow<number>('BOOKING_HOLD_TTL_SECONDS');

        try {
            const entity = await this._bookingRepository.holdSlot({ studentId, slotId: dto.slotId, idempotencyKey }, ttl);
            return BookingResponseDto.fromEntity('Slot held successfully. Complete payment to confirm.', entity);
        } catch (error) {
            this._translateDomainError(error);
        }
    }

    async getById(userId: string, roles: UserRole | UserRole[], bookingId: string): Promise<BookingResponseDto> {
        const booking = await this._bookingRepository.findById(bookingId);
        const roleList = Array.isArray(roles) ? roles : [roles];

        if (!booking || !this._canView(booking, userId, roleList)) {
            throw new NotFoundException('Booking not found');
        }

        return BookingResponseDto.fromEntity('Booking fetched successfully', booking);
    }

    async getBookingForPayment(bookingId: string, studentId: string): Promise<BookingForPaymentDto> {
        const booking = await this._bookingRepository.findById(bookingId);

        if (!booking || booking.studentId !== studentId) {
            throw new NotFoundException('Booking not found');
        }

        if (booking.status !== BookingStatus.PAYMENT_PENDING) {
            throw new BadRequestException('Booking is not in a payable state');
        }

        if (booking.holdExpiresAt < new Date()) {
            throw new BadRequestException('Booking hold has expired. Please create a new booking.');
        }

        return BookingForPaymentDto.fromEntity(booking);
    }

    async listStudent(studentId: string, query: BookingQueryDto): Promise<PaginatedBookingsResponseDto> {
        const result = await this._bookingRepository.findStudentBookings(studentId, this._toListQuery(query));
        return PaginatedBookingsResponseDto.fromEntity('Bookings fetched successfully', result);
    }

    async listInstructor(userId: string, query: BookingQueryDto): Promise<PaginatedBookingsResponseDto> {
        const profileId = await this._bookingRepository.findApprovedProfileIdByUserId(userId);

        if (!profileId) {
            throw new NotFoundException('Approved instructor profile not found');
        }

        const result = await this._bookingRepository.findInstructorBookings(profileId, this._toListQuery(query));
        return PaginatedBookingsResponseDto.fromEntity('Instructor bookings fetched successfully', result);
    }

    async listAdmin(query: BookingQueryDto): Promise<PaginatedBookingsResponseDto> {
        const result = await this._bookingRepository.findAdminBookings(this._toListQuery(query));
        return PaginatedBookingsResponseDto.fromEntity('Bookings fetched successfully', result);
    }

    async cancel(userId: string, roles: UserRole | UserRole[], bookingId: string, dto?: CancelBookingDto): Promise<BookingResponseDto> {
        const booking = await this._bookingRepository.findById(bookingId);

        if (!booking) throw new NotFoundException('Booking not found');

        const roleList = Array.isArray(roles) ? roles : [roles];
        const isAdmin = roleList.includes(UserRole.ADMIN);
        const isStudent = booking.studentId === userId;
        const isInstructor = booking.instructor.userId === userId;

        if (!isAdmin && !isStudent && !isInstructor) throw new NotFoundException('Booking not found');

        if (isInstructor && !isAdmin && booking.status !== BookingStatus.CONFIRMED)
            throw new BadRequestException('Instructors can only cancel confirmed sessions');

        // Capture the status before cancellation to determine refund eligibility
        const wasPaid = booking.status === BookingStatus.CONFIRMED;

        const reason = dto?.reason;
        let cancelled: BookingEntity;
        try {
            cancelled = await this._bookingRepository.cancelBooking({ bookingId, actorId: userId, reason });
        } catch (error) {
            this._translateDomainError(error);
        }

        // ─── Auto-refund for cancellations of paid bookings ───
        if (wasPaid) {
            this._processRefundAfterCancel(
                cancelled,
                isInstructor || isAdmin,
                reason ?? (isAdmin ? 'Cancelled by administrator — full refund' : undefined),
            );
        }

        return BookingResponseDto.fromEntity('Booking cancelled successfully', cancelled);
    }

    async complete(instructorUserId: string, bookingId: string): Promise<BookingResponseDto> {
        const booking = await this._bookingRepository.findById(bookingId);

        if (!booking || booking.instructor.userId !== instructorUserId)
            throw new NotFoundException('Booking not found');

        try {
            const entity = await this._bookingRepository.completeBooking({ bookingId });
            return BookingResponseDto.fromEntity('Session marked as completed', entity);
        } catch (error) {
            this._translateDomainError(error);
        }
    }


    expireHolds(): Promise<number> {
        return this._bookingRepository.expireHolds();
    }

    // ─── Private helpers ────────────────────────────────────────────

    private _toListQuery(query: BookingQueryDto): BookingListQuery {
        return {
            status: query.status,
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
            page: query.page ?? 1,
            limit: query.limit ?? 20,
        };
    }

    /**
     * Determines refund % and emits booking.cancelled event.
     * Payment module listens to this event to issue refunds asynchronously.
     */
    private _processRefundAfterCancel(
        booking: BookingEntity,
        isFullRefundActor: boolean,
        reason?: string,
    ): void {
        // Instructor or Admin cancels → always 100% (not the student's fault)
        if (isFullRefundActor) {
            this._eventEmitter.emit(
                'booking.cancelled',
                new BookingCancelledEvent(
                    booking.id,
                    100,
                    reason ?? 'Cancelled by platform/instructor — full refund',
                ),
            );
            return;
        }

        // Student cancels → apply time-based policy
        const eligibility = calculateRefundEligibility(booking.slot.startTime);

        if (!eligibility.eligible) {
            this._logger.log(
                `No refund for booking ${booking.id}: ${eligibility.reason}`,
                BookingService.name,
            );
            return;
        }

        this._eventEmitter.emit(
            'booking.cancelled',
            new BookingCancelledEvent(
                booking.id,
                eligibility.refundPercentage,
                reason ?? eligibility.reason,
            ),
        );
    }

    private _canView(booking: BookingEntity, userId: string, roles: UserRole[]): boolean {
        if (roles.includes(UserRole.ADMIN)) return true;
        if (booking.studentId === userId) return true;
        if (roles.includes(UserRole.INSTRUCTOR) && booking.instructor.userId === userId) return true;
        return false;
    }

    private _translateDomainError(error: unknown): never {
        if (error instanceof SlotNotFoundError) throw new NotFoundException(error.message);
        if (error instanceof BookingNotFoundError) throw new NotFoundException(error.message);
        if (error instanceof BookingConflictError) throw new ConflictException(error.message);
        if (error instanceof BookingValidationError) throw new BadRequestException(error.message);
        throw error as Error;
    }
}