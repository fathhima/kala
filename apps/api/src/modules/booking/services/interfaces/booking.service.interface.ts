import { BookingQueryDto, CancelBookingDto, CreateBookingDto } from '../../dto/request/booking.request.dto';
import { BookingForPaymentDto, BookingResponseDto, PaginatedBookingsResponseDto } from '../../dto/response/booking-response.dto';
import { UserRole } from '@/shared/enums/role.enum';

export const BOOKING_SERVICE = Symbol('BOOKING_SERVICE');

export interface IBookingService {
    hold(studentId: string, dto: CreateBookingDto, idempotencyKey?: string): Promise<BookingResponseDto>;
    
    getById(userId: string, roles: UserRole | UserRole[], bookingId: string): Promise<BookingResponseDto>;

    getBookingForPayment(bookingId: string, studentId: string): Promise<BookingForPaymentDto>;

    listStudent(studentId: string, query: BookingQueryDto): Promise<PaginatedBookingsResponseDto>;

    listInstructor(userId: string, query: BookingQueryDto): Promise<PaginatedBookingsResponseDto>;

    listAdmin(query: BookingQueryDto): Promise<PaginatedBookingsResponseDto>;

    cancel(userId: string, roles: UserRole | UserRole[], bookingId: string, dto?: CancelBookingDto): Promise<BookingResponseDto>;

    complete(instructorUserId: string, bookingId: string): Promise<BookingResponseDto>;

    expireHolds(): Promise<number>;
}