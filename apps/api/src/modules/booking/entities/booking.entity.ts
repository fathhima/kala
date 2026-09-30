import { BookingStatus } from '../enums/booking.enum';
import { SlotStatus } from '@/modules/slot/enums/slot.enum';

export class BookingStudentEntity {
    id!: string;
    name!: string;
    email!: string;
    imageUrl!: string | null;
}

export class BookingInstructorEntity {
    profileId!: string;
    userId!: string;
    name!: string;
    imageUrl!: string | null;
}

export class BookingOfferingEntity {
    id!: string;
    title!: string | null;
    hourlyRate!: number;
    currency!: string;
    subcategory!: { id: string; name: string };
}

export class BookingSlotEntity {
    id!: string;
    startTime!: Date;
    endTime!: Date;
    timezone!: string;
    title!: string | null;
    status!: SlotStatus;
    heldUntil!: Date | null;
}

export class BookingEntity {
    id!: string;
    slotId!: string;
    studentId!: string;
    offeringId!: string;
    profileId!: string;
    status!: BookingStatus;
    amount!: number;
    currency!: string;
    hourlyRate!: number;
    durationMinutes!: number;
    holdExpiresAt!: Date;
    cancelledAt!: Date | null;
    cancelledBy!: string | null;
    cancelReason!: string | null;
    createdAt!: Date;
    updatedAt!: Date;
    slot!: BookingSlotEntity;
    student!: BookingStudentEntity;
    offering!: BookingOfferingEntity;
    instructor!: BookingInstructorEntity;
}

export class PaginatedBookingEntity {
    items!: BookingEntity[];
    total!: number;
    page!: number;
    limit!: number;
}