import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IBookingService } from './interfaces/booking.service.interface';
import { BOOKING_REPOSITORY, type IBookingRepository } from '../repositories/interfaces/booking.interface';
import { BookingEntity, PaginatedBookingEntity } from '../entities/booking.entity';
import { BookingListQuery } from '../types/booking.type';
import { UserRole } from '@/shared/enums/role.enum';

@Injectable()
export class BookingService implements IBookingService {
    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly _bookingRepository: IBookingRepository,
        private readonly _configService: ConfigService,
    ) {}

    async hold(studentId: string, slotId: string): Promise<BookingEntity> {
        const ttl = this._configService.getOrThrow<number>('BOOKING_HOLD_TTL_SECONDS');

        return this._bookingRepository.holdSlot({ studentId, slotId }, ttl);
    }

    async getById(userId: string, roles: UserRole[], bookingId: string): Promise<BookingEntity> {
        const booking = await this._bookingRepository.findById(bookingId);
        if (!booking || !this._canView(booking, userId, roles)) {
            throw new NotFoundException('Booking not found');
        }

        return booking;
    }

    listMine(studentId: string, query: BookingListQuery): Promise<PaginatedBookingEntity> {
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

    cancel(userId: string, roles: UserRole[], bookingId: string, reason?: string): Promise<BookingEntity> {
        return this._bookingRepository.cancelBooking({
            bookingId,
            actorId: userId,
            roles,
            reason,
        });
    }

    async confirm(studentId: string, bookingId: string, allowManual: boolean): Promise<BookingEntity> {
        if (!allowManual) {
            throw new ForbiddenException('Manual confirm is disabled');
        }
        
        return this._bookingRepository.confirmBooking({ bookingId, actorId: studentId });
    }

    complete(instructorUserId: string, bookingId: string): Promise<BookingEntity> {
        return this._bookingRepository.completeBooking({ bookingId, instructorUserId });
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
}