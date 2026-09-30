import { BookingEntity, PaginatedBookingEntity } from '../../entities/booking.entity';
import { BookingListQuery, CancelBookingInput, CompleteBookingInput, ConfirmBookingInput, CreateBookingInput } from '../../types/booking.type';

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');

export interface IBookingRepository {
    holdSlot(input: CreateBookingInput, holdTtlSeconds: number): Promise<BookingEntity>;

    findById(id: string): Promise<BookingEntity | null>;

    findStudentBookings(studentId: string, query: BookingListQuery): Promise<PaginatedBookingEntity>;

    findInstructorBookings(profileId: string, query: BookingListQuery): Promise<PaginatedBookingEntity>;

    findAdminBookings(query: BookingListQuery): Promise<PaginatedBookingEntity>;

    findApprovedProfileIdByUserId(userId: string): Promise<string | null>;

    cancelBooking(input: CancelBookingInput): Promise<BookingEntity>;

    confirmBooking(input: ConfirmBookingInput): Promise<BookingEntity>;

    completeBooking(input: CompleteBookingInput): Promise<BookingEntity>;
    
    expireHolds(): Promise<number>;
}