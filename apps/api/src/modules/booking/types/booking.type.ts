import { BookingStatus } from '../enums/booking.enum';
import { UserRole } from '@/shared/enums/role.enum';

export type CreateBookingInput = {
    studentId: string;
    slotId: string;
};

export type CancelBookingInput = {
    bookingId: string;
    actorId: string;
    roles: UserRole[];
    reason?: string | null;
};

export type ConfirmBookingInput = {
    bookingId: string;
    actorId: string;
};

export type CompleteBookingInput = {
    bookingId: string;
    instructorUserId: string;
};

export type BookingListQuery = {
    status?: BookingStatus;
    from?: Date;
    to?: Date;
    page: number;
    limit: number;
};