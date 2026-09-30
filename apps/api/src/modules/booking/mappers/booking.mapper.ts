import { Prisma } from '@prisma/client';
import { BookingEntity, PaginatedBookingEntity } from '../entities/booking.entity';
import { BookingStatus } from '../enums/booking.enum';
import { SlotStatus } from '@/modules/slot/enums/slot.enum';

export const bookingInclude = {
    slot: true,
    student: {
        select: { id: true, name: true, email: true, imageUrl: true },
    },
    offering: {
        select: {
            id: true,
            title: true,
            hourlyRate: true,
            currency: true,
            subcategory: { select: { id: true, name: true } },
        },
    },
    profile: {
        select: {
            id: true,
            user: { select: { id: true, name: true, imageUrl: true } },
        },
    },
} satisfies Prisma.BookingInclude;

export type BookingRecord = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

export class BookingMapper {
    static toEntity(record: BookingRecord): BookingEntity {
        const entity = new BookingEntity();
        entity.id = record.id;
        entity.slotId = record.slotId;
        entity.studentId = record.studentId;
        entity.offeringId = record.offeringId;
        entity.profileId = record.profileId;
        entity.status = record.status as BookingStatus;
        entity.amount = Number(record.amount);
        entity.currency = record.currency;
        entity.hourlyRate = Number(record.hourlyRate);
        entity.durationMinutes = record.durationMinutes;
        entity.holdExpiresAt = record.holdExpiresAt;
        entity.cancelledAt = record.cancelledAt;
        entity.cancelledBy = record.cancelledBy;
        entity.cancelReason = record.cancelReason;
        entity.createdAt = record.createdAt;
        entity.updatedAt = record.updatedAt;
        entity.slot = {
            id: record.slot.id,
            startTime: record.slot.startTime,
            endTime: record.slot.endTime,
            timezone: record.slot.timezone,
            title: record.slot.title,
            status: record.slot.status as SlotStatus,
            heldUntil: record.slot.heldUntil,
        };
        entity.student = {
            id: record.student.id,
            name: record.student.name,
            email: record.student.email,
            imageUrl: record.student.imageUrl,
        };
        entity.offering = {
            id: record.offering.id,
            title: record.offering.title,
            hourlyRate: Number(record.offering.hourlyRate),
            currency: record.offering.currency,
            subcategory: record.offering.subcategory,
        };
        entity.instructor = {
            profileId: record.profile.id,
            userId: record.profile.user.id,
            name: record.profile.user.name,
            imageUrl: record.profile.user.imageUrl,
        };
        return entity;
    }

    static toPaginated(records: BookingRecord[], total: number, page: number, limit: number,): PaginatedBookingEntity {
        const entity = new PaginatedBookingEntity();
        entity.items = records.map(BookingMapper.toEntity);
        entity.total = total;
        entity.page = page;
        entity.limit = limit;
        return entity;
    }
}