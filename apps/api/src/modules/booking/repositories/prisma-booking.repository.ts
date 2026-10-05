import { Injectable, } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { IBookingRepository } from './interfaces/booking.interface';
import { BookingMapper, bookingInclude, type BookingRecord } from '../mappers/booking.mapper';
import { BookingEntity, PaginatedBookingEntity } from '../entities/booking.entity';
import { BookingListQuery, CancelBookingInput, CompleteBookingInput, ConfirmBookingInput, CreateBookingInput, } from '../types/booking.type';
import { BookingStatus } from '../enums/booking.enum';
import { SlotStatus } from '@/modules/slot/enums/slot.enum';
import { InstructorProfileStatus, OfferingStatus } from '@/modules/instructor/enums/instructor.enum';
import { BookingConflictError, BookingNotFoundError, BookingValidationError, SlotNotFoundError } from '../errors/booking.errors';

type LockedSlotRow = {
    id: string;
    profileId: string;
    offeringId: string;
    status: SlotStatus;
    startTime: Date;
    endTime: Date;
    heldUntil: Date | null;
    heldByUserId: string | null;
    hourlyRate: Prisma.Decimal;
    currency: string;
    offeringStatus: OfferingStatus;
    instructorUserId: string;
    profileStatus: InstructorProfileStatus;
};

@Injectable()
export class PrismaBookingRepository implements IBookingRepository {
    constructor(private readonly _prisma: PrismaService) { }

    async holdSlot(input: CreateBookingInput, holdTtlSeconds: number): Promise<BookingEntity> {
        // ─── Idempotency check ─────────────────────────────────────────
        if (input.idempotencyKey) {
            const existing = await this._prisma.booking.findUnique({
                where: { idempotencyKey: input.idempotencyKey },
                include: bookingInclude,
            });

            if (existing) return BookingMapper.toEntity(existing);
        }

        try {
            return await this._prisma.$transaction(
                async (tx) => {
                    /* 
                    $executeRaw - for executing raw sql
                                   - it supports tagged template literal
                    LOCAL - apply setting only to current transaction
                    lock_timeout - maximum time to wait
                    */
                    await tx.$executeRaw`SET LOCAL lock_timeout = '3s'`;

                    /* 
                    $queryRaw - execute the SQL query and return the row in array
                    LockedSlotRow - return type
                    FOR NO KEY UPDATE - lock the selected row with a NO KEY UPDATE row lock
                                      - row lock means, it locks the row, so another transaction cannot make changes
                    */
                    const rows = await tx.$queryRaw<LockedSlotRow[]>`
                        SELECT
                            s.id,
                            s."profileId",
                            s."offeringId",
                            s.status,
                            s."startTime",
                            s."endTime",
                            s."heldUntil",
                            s."heldByUserId",
                            o."hourlyRate",
                            o.currency,
                            o.status AS "offeringStatus",
                            p."userId" AS "instructorUserId",
                            p.status AS "profileStatus"
                        FROM availability_slots s
                        INNER JOIN instructor_offerings o ON o.id = s."offeringId"
                        INNER JOIN instructor_profiles p ON p.id = s."profileId"
                        WHERE s.id = ${input.slotId}
                        FOR NO KEY UPDATE OF s
                    `;

                    const slot = rows[0];

                    if (!slot) {
                        throw new SlotNotFoundError('Slot not found');
                    }

                    if (slot.instructorUserId === input.studentId) {
                        throw new BookingValidationError('You cannot book your own session');
                    }

                    if (
                        slot.offeringStatus !== OfferingStatus.APPROVED ||
                        slot.profileStatus !== InstructorProfileStatus.APPROVED
                    ) {
                        throw new BookingConflictError('This offering is not available for booking');
                    }

                    const now = new Date();

                    if (slot.startTime <= now) {
                        throw new BookingValidationError('This slot has already started');
                    }

                    if (slot.status === SlotStatus.CANCELLED) {
                        throw new BookingConflictError('This slot was cancelled by the instructor');
                    }

                    if (slot.status === SlotStatus.BOOKED) {
                        throw new BookingConflictError('This slot is already booked');
                    }

                    const holdIsLive = slot.status === SlotStatus.HELD && slot.heldUntil !== null && slot.heldUntil > now;

                    if (holdIsLive && slot.heldByUserId === input.studentId) {
                        const existing = await tx.booking.findFirst({
                            where: {
                                slotId: slot.id,
                                studentId: input.studentId,
                                status: BookingStatus.PAYMENT_PENDING,
                            },
                            include: bookingInclude,
                        });

                        if (existing) return BookingMapper.toEntity(existing);
                    }

                    if (holdIsLive && slot.heldByUserId !== input.studentId) {
                        throw new BookingConflictError('This slot is currently held by another student');
                    }

                    if (slot.status === SlotStatus.HELD && !holdIsLive) {
                        await tx.booking.updateMany({
                            where: { slotId: slot.id, status: BookingStatus.PAYMENT_PENDING },
                            data: { status: BookingStatus.EXPIRED },
                        });
                    }

                    const durationMs = slot.endTime.getTime() - slot.startTime.getTime();
                    const durationMinutes = Math.round(durationMs / 60_000);
                    const amount = new Prisma.Decimal(slot.hourlyRate)
                        .mul(durationMinutes)
                        .div(60)
                        .toDecimalPlaces(2);
                    const holdExpiresAt = new Date(now.getTime() + holdTtlSeconds * 1000);

                    const created = await tx.booking.create({
                        data: {
                            slotId: slot.id,
                            studentId: input.studentId,
                            offeringId: slot.offeringId,
                            profileId: slot.profileId,
                            status: BookingStatus.PAYMENT_PENDING,
                            amount,
                            currency: slot.currency,
                            hourlyRate: slot.hourlyRate,
                            durationMinutes,
                            holdExpiresAt,
                            idempotencyKey: input.idempotencyKey ?? null,
                        },
                        include: bookingInclude,
                    });

                    await tx.availabilitySlot.update({
                        where: { id: slot.id },
                        data: {
                            status: SlotStatus.HELD,
                            heldUntil: holdExpiresAt,
                            heldByUserId: input.studentId,
                            heldByBookingId: created.id,
                            bookedAt: null,
                        },
                    });

                    return BookingMapper.toEntity(created);
                },
                /* 
                timeout - transaction will not run more than 10s
                 */
                { timeout: 10_000, isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
            );
        } catch (error) {
            this._rethrowLockOrUnique(error);
            throw error;
        }
    }

    async findById(id: string): Promise<BookingEntity | null> {
        const record = await this._prisma.booking.findUnique({
            where: { id },
            include: bookingInclude,
        });
        return record ? BookingMapper.toEntity(record) : null;
    }

    async findStudentBookings(studentId: string, query: BookingListQuery): Promise<PaginatedBookingEntity> {
        return this._paginate({ studentId }, query);
    }

    async findInstructorBookings(profileId: string, query: BookingListQuery): Promise<PaginatedBookingEntity> {
        return this._paginate({ profileId }, query);
    }

    async findAdminBookings(query: BookingListQuery): Promise<PaginatedBookingEntity> {
        return this._paginate({}, query);
    }

    async findApprovedProfileIdByUserId(userId: string): Promise<string | null> {
        const profile = await this._prisma.instructorProfile.findFirst({
            where: { userId, status: InstructorProfileStatus.APPROVED },
            select: { id: true },
        });
        return profile?.id ?? null;
    }

    async cancelBooking(input: CancelBookingInput): Promise<BookingEntity> {
        try {
            return await this._prisma.$transaction(async (tx) => {
                await tx.$executeRaw`SET LOCAL lock_timeout = '3s'`;

                const preview = await tx.booking.findUnique({
                    where: { id: input.bookingId },
                    select: { id: true, slotId: true },
                });

                if (!preview) throw new BookingNotFoundError('Booking not found');

                await tx.$queryRaw`
                    SELECT id FROM availability_slots
                    WHERE id = ${preview.slotId}
                    FOR NO KEY UPDATE
                `;

                const record = await tx.booking.findUnique({
                    where: { id: input.bookingId },
                    include: bookingInclude,
                });

                if (!record) throw new BookingNotFoundError('Booking not found');

                await tx.$queryRaw`
                    SELECT id FROM bookings
                    WHERE id = ${input.bookingId}
                    FOR UPDATE
                `;

                if (record.status === BookingStatus.COMPLETED) {
                    throw new BookingValidationError('Completed bookings cannot be cancelled');
                }

                if (
                    record.status === BookingStatus.CANCELLED ||
                    record.status === BookingStatus.EXPIRED
                ) {
                    throw new BookingValidationError('Booking is already cancelled');
                }

                if (
                    record.status !== BookingStatus.PAYMENT_PENDING &&
                    record.status !== BookingStatus.CONFIRMED
                ) {
                    throw new BookingValidationError('Booking cannot be cancelled in its current state');
                }

                const updated = await tx.booking.update({
                    where: { id: record.id },
                    data: {
                        status: BookingStatus.CANCELLED,
                        cancelledAt: new Date(),
                        cancelledBy: input.actorId,
                        cancelReason: input.reason ?? null,
                    },
                    include: bookingInclude,
                });

                await tx.availabilitySlot.update({
                    where: { id: record.slotId },
                    data: {
                        status: SlotStatus.AVAILABLE,
                        heldUntil: null,
                        heldByUserId: null,
                        heldByBookingId: null,
                        bookedAt: null,
                    },
                });

                return BookingMapper.toEntity(updated);
            });
        } catch (error) {
            this._rethrowLockOrUnique(error);
            throw error;
        }
    }

    async completeBooking(input: CompleteBookingInput): Promise<BookingEntity> {
        return this._prisma.$transaction(async (tx) => {
            const preview = await tx.booking.findUnique({
                where: { id: input.bookingId },
                select: { id: true, slotId: true },
            });

            if (!preview) throw new BookingNotFoundError('Booking not found');

            await tx.$queryRaw`
                SELECT id FROM availability_slots
                WHERE id = ${preview.slotId}
                FOR NO KEY UPDATE
            `;

            const record = await tx.booking.findUnique({
                where: { id: input.bookingId },
                include: bookingInclude,
            });

            if (!record) throw new BookingNotFoundError('Booking not found');

            if (record.status === BookingStatus.COMPLETED) {
                return BookingMapper.toEntity(record);
            }

            if (record.status !== BookingStatus.CONFIRMED) {
                throw new BookingValidationError('Only confirmed sessions can be completed');
            }

            if (record.slot.endTime > new Date()) {
                throw new BookingValidationError('Session has not ended yet');
            }

            const updated = await tx.booking.update({
                where: { id: record.id },
                data: { status: BookingStatus.COMPLETED },
                include: bookingInclude,
            });

            return BookingMapper.toEntity(updated);
        });
    }

    async expireHolds(): Promise<number> {

         // 1. Fast check: if nothing is expired, exit immediately without taking a transaction
    const hasExpired = await this._prisma.availabilitySlot.findFirst({
        where: {
            status: SlotStatus.HELD,
            heldUntil: { lt: new Date() },
        },
        select: { id: true },
    });
    if (!hasExpired) return 0;
    
        return this._prisma.$transaction(async (tx) => {
            const rows = await tx.$queryRaw<{ id: string }[]>`
                SELECT id
                FROM availability_slots
                WHERE status = CAST('HELD' AS "SlotStatus")
                  AND "heldUntil" < now()
                ORDER BY id
                LIMIT 50
                FOR NO KEY UPDATE SKIP LOCKED
            `;

            if (!rows.length) return 0;

            const ids = rows.map((row) => row.id);

            await tx.booking.updateMany({
                where: { slotId: { in: ids }, status: BookingStatus.PAYMENT_PENDING },
                data: { status: BookingStatus.EXPIRED },
            });

            await tx.availabilitySlot.updateMany({
                where: { id: { in: ids }, status: SlotStatus.HELD },
                data: {
                    status: SlotStatus.AVAILABLE,
                    heldUntil: null,
                    heldByUserId: null,
                    heldByBookingId: null,
                },
            });

            return ids.length;
        });
    }

    private async _paginate(whereBase: Prisma.BookingWhereInput, query: BookingListQuery,): Promise<PaginatedBookingEntity> {
        const where: Prisma.BookingWhereInput = {
            ...whereBase,
            status: query.status,
            slot:
                query.from || query.to
                    ? {
                        startTime: {
                            gte: query.from,
                            lte: query.to,
                        },
                    }
                    : undefined,
        };

        const [records, total] = await this._prisma.$transaction([
            this._prisma.booking.findMany({
                where,
                include: bookingInclude,
                orderBy: { slot: { startTime: 'asc' } },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this._prisma.booking.count({ where }),
        ]);

        return BookingMapper.toPaginated(records as BookingRecord[], total, query.page, query.limit);
    }

    private _rethrowLockOrUnique(error: unknown): void {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new BookingConflictError('This slot is already booked');
        }

        const message = error instanceof Error ? error.message : '';
        if (message.includes('lock timeout') || message.includes('55P03')) {
            throw new BookingConflictError('This slot is being booked by another student, please retry');
        }
    }
}