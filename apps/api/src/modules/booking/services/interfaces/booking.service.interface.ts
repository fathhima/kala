import { BookingEntity, PaginatedBookingEntity } from '../../entities/booking.entity';
import { BookingListQuery } from '../../types/booking.type';
import { UserRole } from '@/shared/enums/role.enum';

export const BOOKING_SERVICE = Symbol('BOOKING_SERVICE');

export interface IBookingService {
    hold(studentId: string, slotId: string): Promise<BookingEntity>;

    getById(userId: string, roles: UserRole[], bookingId: string): Promise<BookingEntity>;

    listStudent(studentId: string, query: BookingListQuery): Promise<PaginatedBookingEntity>;

    listInstructor(userId: string, query: BookingListQuery): Promise<PaginatedBookingEntity>;

    listAdmin(query: BookingListQuery): Promise<PaginatedBookingEntity>;

    cancel(userId: string, roles: UserRole[], bookingId: string, reason?: string): Promise<BookingEntity>;

    complete(instructorUserId: string, bookingId: string): Promise<BookingEntity>;

    expireHolds(): Promise<number>;
}