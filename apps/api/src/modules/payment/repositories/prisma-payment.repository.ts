import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { IPaymentRepository } from './interfaces/payment.repository.interface';
import { PaymentMapper, } from '../mappers/payment.mapper';
import { PaymentEntity, PaginatedPaymentEntity } from '../entities/payment.entity';
import { CreatePaymentInput, ConfirmPaymentInput, PaymentListQuery } from '../types/payment.type';
import { PaymentGateway, PaymentStatus, } from '../enums/payment.enum';
import { BookingStatus } from '@/modules/booking/enums/booking.enum';
import { SlotStatus } from '@/modules/slot/enums/slot.enum';
import {
    PaymentConflictError,
    PaymentNotFoundError,
    PaymentValidationError,
} from '../errors/payment.errors';

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
    constructor(private readonly _prisma: PrismaService) { }

    async create(input: CreatePaymentInput, gatewaySessionId: string): Promise<PaymentEntity> {
        const record = await this._prisma.payment.create({
            data: {
                bookingId: input.bookingId,
                studentId: input.studentId,
                amount: input.amount,
                currency: input.currency,
                status: PaymentStatus.PENDING,
                gateway: PaymentGateway.RAZORPAY,
                gatewaySessionId,
            },
        });
        return PaymentMapper.toEntity(record);
    }

    async findById(id: string): Promise<PaymentEntity | null> {
        const record = await this._prisma.payment.findUnique({ where: { id } });
        return record ? PaymentMapper.toEntity(record) : null;
    }

    async findByBookingId(bookingId: string): Promise<PaymentEntity | null> {
        const record = await this._prisma.payment.findFirst({
            where: {
                bookingId,
                status: {
                    in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.SUCCEEDED],
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return record ? PaymentMapper.toEntity(record) : null;
    }

    async findByGatewaySessionId(sessionId: string): Promise<PaymentEntity | null> {
        const record = await this._prisma.payment.findFirst({
            where: { gatewaySessionId: sessionId },
        });
        return record ? PaymentMapper.toEntity(record) : null;
    }

    async confirmPayment(input: ConfirmPaymentInput): Promise<PaymentEntity> {
        try {
            return await this._prisma.$transaction(async (tx) => {
                await tx.$executeRaw`SET LOCAL lock_timeout = '3s'`;

                const payment = await tx.payment.findFirst({
                    where: { gatewaySessionId: input.gatewaySessionId },
                });

                if (!payment) {
                    throw new PaymentNotFoundError('Payment not found for this session');
                }

                // Idempotency: already succeeded → return as-is
                if (payment.status === PaymentStatus.SUCCEEDED) {
                    return PaymentMapper.toEntity(payment);
                }

                if (
                    payment.status !== PaymentStatus.PENDING &&
                    payment.status !== PaymentStatus.PROCESSING
                ) {
                    throw new PaymentValidationError(
                        `Payment cannot be confirmed in status: ${payment.status}`,
                    );
                }

                // gatewayId unique constraint ensures idempotency for duplicate webhooks
                const updatedPayment = await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: PaymentStatus.SUCCEEDED,
                        gatewayId: input.gatewayPaymentIntentId,
                        paidAt: new Date(),
                    },
                });

                const booking = await tx.booking.findUnique({
                    where: { id: payment.bookingId },
                    select: { id: true, slotId: true, status: true },
                });

                if (!booking) {
                    throw new PaymentNotFoundError('Associated booking not found');
                }

                if (booking.status === BookingStatus.PAYMENT_PENDING) {
                    await tx.booking.update({
                        where: { id: booking.id },
                        data: { status: BookingStatus.CONFIRMED },
                    });

                    await tx.availabilitySlot.update({
                        where: { id: booking.slotId },
                        data: {
                            status: SlotStatus.BOOKED,
                            bookedAt: new Date(),
                            heldUntil: null,
                        },
                    });
                }

                return PaymentMapper.toEntity(updatedPayment);
            }, {
                timeout: 10_000,
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                const existing = await this._prisma.payment.findFirst({
                    where: { gatewayId: input.gatewayPaymentIntentId },
                });
                if (existing) return PaymentMapper.toEntity(existing);
                throw new PaymentConflictError('Duplicate payment detected');
            }
            throw error;
        }
    }

    async refundPayment(
        paymentId: string, refundId: string, refundAmount: number,
    ): Promise<PaymentEntity> {
        return this._prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({ where: { id: paymentId } });

            if (!payment) throw new PaymentNotFoundError('Payment not found');

            if (payment.status !== PaymentStatus.SUCCEEDED) {
                throw new PaymentValidationError('Only succeeded payments can be refunded');
            }

            const updated = await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status: PaymentStatus.REFUNDED,
                    refundId,
                    refundAmount,
                    refundedAt: new Date(),
                },
            });

            await tx.booking.update({
                where: { id: payment.bookingId },
                data: {
                    status: BookingStatus.CANCELLED,
                    cancelledAt: new Date(),
                    cancelReason: 'Payment refunded',
                },
            });

            const booking = await tx.booking.findUnique({
                where: { id: payment.bookingId },
                select: { slotId: true },
            });

            if (booking) {
                await tx.availabilitySlot.update({
                    where: { id: booking.slotId },
                    data: {
                        status: SlotStatus.AVAILABLE,
                        heldUntil: null,
                        heldByUserId: null,
                        bookedAt: null,
                    },
                });
            }

            return PaymentMapper.toEntity(updated);
        });
    }

    async findStudentPayments(
        studentId: string, query: PaymentListQuery,
    ): Promise<PaginatedPaymentEntity> {
        return this._paginate({ studentId }, query);
    }

    async findAdminPayments(query: PaymentListQuery): Promise<PaginatedPaymentEntity> {
        return this._paginate({}, query);
    }

    private async _paginate(
        whereBase: Prisma.PaymentWhereInput, query: PaymentListQuery,
    ): Promise<PaginatedPaymentEntity> {
        const where: Prisma.PaymentWhereInput = {
            ...whereBase,
            status: query.status as string as Prisma.EnumPaymentStatusFilter | undefined,
            createdAt: query.from || query.to
                ? { gte: query.from, lte: query.to }
                : undefined,
        };

        const [records, total] = await this._prisma.$transaction([
            this._prisma.payment.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            this._prisma.payment.count({ where }),
        ]);

        return PaymentMapper.toPaginated(records, total, query.page, query.limit);
    }
}