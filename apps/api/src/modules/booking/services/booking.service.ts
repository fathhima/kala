import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable,NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IBookingService } from './interfaces/booking.service.interface';
import { BOOKING_REPOSITORY, type IBookingRepository } from '../repositories/interfaces/booking.interface';
import { BookingEntity, PaginatedBookingEntity } from '../entities/booking.entity';
import { BookingListQuery } from '../types/booking.type';
import { UserRole } from '@/shared/enums/role.enum';
import { type ILoggerService, LOGGER_SERVICE } from '@/shared/logger/repositories/interfaces/logger.interface';
import { BookingStatus } from '../enums/booking.enum';
import { BookingConflictError, BookingNotFoundError, BookingValidationError, SlotNotFoundError } from '../errors/booking.errors';

@Injectable()
export class BookingService implements IBookingService, OnModuleInit, OnModuleDestroy {
    private _holdExpiryTimer?: NodeJS.Timeout;

    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly _bookingRepository: IBookingRepository,
        private readonly _configService: ConfigService,
        @Inject(LOGGER_SERVICE)
        private readonly _logger: ILoggerService,
    ) { }

    onModuleInit() {
        this._holdExpiryTimer = setInterval(() => {
            this.expireHolds().catch((error: unknown) => {
                this._logger.error('Failed to expire booking holds', error instanceof Error ? error.stack : String(error),
                    BookingService.name,);
            });
        }, 15_000);
    }

    onModuleDestroy() {
        if (this._holdExpiryTimer) clearInterval(this._holdExpiryTimer);
    }

    async hold(studentId: string, slotId: string): Promise<BookingEntity> {
        const ttl = this._configService.getOrThrow<number>('BOOKING_HOLD_TTL_SECONDS');

        try {
            return await this._bookingRepository.holdSlot({ studentId, slotId }, ttl);
        } catch (error) {
            this._translateDomainError(error);
        }
    }

    async getById(userId: string, roles: UserRole[], bookingId: string): Promise<BookingEntity> {
        const booking = await this._bookingRepository.findById(bookingId);
        if (!booking || !this._canView(booking, userId, roles)) {
            throw new NotFoundException('Booking not found');
        }

        return booking;
    }

    listStudent(studentId: string, query: BookingListQuery): Promise<PaginatedBookingEntity> {
        return this._bookingRepository.findStudentBookings(studentId, query);
    }

    async listInstructor(userId: string, query: BookingListQuery): Promise<PaginatedBookingEntity> {
        const profileId = await this._bookingRepository.findApprovedProfileIdByUserId(userId);

        if (!profileId) {
            throw new NotFoundException('Approved instructor profile not found');
        }

        return this._bookingRepository.findInstructorBookings(profileId, query);
    }

    listAdmin(query: BookingListQuery): Promise<PaginatedBookingEntity> {
        return this._bookingRepository.findAdminBookings(query);
    }

    async cancel(userId: string, roles: UserRole[], bookingId: string, reason?: string): Promise<BookingEntity> {
        const booking = await this._bookingRepository.findById(bookingId);

        if (!booking) throw new NotFoundException('Booking not found');

        const isAdmin = roles.includes(UserRole.ADMIN);
        const isStudent = booking.studentId === userId;
        const isInstructor = booking.instructor.userId === userId;

        if (!isAdmin && !isStudent && !isInstructor) throw new NotFoundException('Booking not found');

        if (isInstructor && !isAdmin && booking.status !== BookingStatus.CONFIRMED)
            throw new BadRequestException('Instructors can only cancel confirmed sessions');

        try {
            return await this._bookingRepository.cancelBooking({ bookingId, actorId: userId, reason });
        } catch (error) {
            this._translateDomainError(error);
        }
    }

    async complete(instructorUserId: string, bookingId: string): Promise<BookingEntity> {
        const booking = await this._bookingRepository.findById(bookingId);

        if (!booking || booking.instructor.userId !== instructorUserId)
            throw new NotFoundException('Booking not found');

        try {
            return await this._bookingRepository.completeBooking({ bookingId });
        } catch (error) {
            this._translateDomainError(error);
        }
    }


    expireHolds(): Promise<number> {
        return this._bookingRepository.expireHolds();
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