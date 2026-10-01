import { BookingStatus } from '../enums/booking.enum';

export type CreateBookingInput = {
    studentId: string;
    slotId: string;
};

export type CancelBookingInput = {
    bookingId: string;
    actorId: string;
    reason?: string | null;
};

export type ConfirmBookingInput = {
    bookingId: string;
};

export type CompleteBookingInput = {
    bookingId: string;
};

export type BookingListQuery = {
    status?: BookingStatus;
    from?: Date;
    to?: Date;
    page: number;
    limit: number;
};