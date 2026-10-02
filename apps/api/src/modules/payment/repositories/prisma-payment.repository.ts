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
import { PaymentConflictError, PaymentNotFoundError, PaymentValidationError, } from '../errors/payment.errors';

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
                    throw new PaymentValidationError(`Payment cannot be confirmed in status: ${payment.status}`,);
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
                            heldByUserId: null,
                            heldByBookingId: null,
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

    async refundPayment(paymentId: string, refundId: string, refundAmount: number,): Promise<PaymentEntity> {
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
                        heldByBookingId: null,
                        bookedAt: null,
                    },
                });
            }

            return PaymentMapper.toEntity(updated);
        });
    }

    // ─── Add these two methods after refundPayment() ────────────────

    async markRefunded(paymentId: string, refundId: string, refundAmount: number, isPartial: boolean,): Promise<PaymentEntity> {
        const payment = await this._prisma.payment.findUnique({
            where: { id: paymentId },
        });

        if (!payment) throw new PaymentNotFoundError('Payment not found');

        if (payment.status !== PaymentStatus.SUCCEEDED) {
            throw new PaymentValidationError('Only succeeded payments can be marked as refunded');
        }

        const updated = await this._prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: isPartial
                    ? PaymentStatus.PARTIALLY_REFUNDED
                    : PaymentStatus.REFUNDED,
                refundId,
                refundAmount,
                refundedAt: new Date(),
            },
        });

        return PaymentMapper.toEntity(updated);
    }

    async markRefundPending(paymentId: string): Promise<void> {
        await this._prisma.payment.updateMany({
            where: {
                id: paymentId,
                status: PaymentStatus.SUCCEEDED,
            },
            data: {
                status: PaymentStatus.REFUND_PENDING,
            },
        });
    }

    async failPayment(gatewaySessionId: string, gatewayPaymentIntentId?: string, failureReason?: string,): Promise<PaymentEntity | null> {
        const payment = await this._prisma.payment.findFirst({
            where: { gatewaySessionId },
        });

        if (!payment) return null;

        // Never overwrite a succeeded payment
        if (payment.status === PaymentStatus.SUCCEEDED) {
            return PaymentMapper.toEntity(payment);
        }

        const updated = await this._prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: PaymentStatus.FAILED,
                gatewayId: gatewayPaymentIntentId || payment.gatewayId,
                failureReason: failureReason ?? 'Payment failed via gateway',
            },
        });

        return PaymentMapper.toEntity(updated);
    }

    async confirmRefundWebhook(gatewayPaymentIntentId: string, gatewayRefundId?: string, refundAmount?: number,)
        : Promise<PaymentEntity | null> {
        return this._prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findFirst({
                where: {
                    OR: [
                        { gatewayId: gatewayPaymentIntentId },
                        ...(gatewayRefundId ? [{ refundId: gatewayRefundId }] : []),
                    ],
                },
            });

            if (!payment) return null;

            // Idempotent: already marked REFUNDED or PARTIALLY_REFUNDED
            if (
                payment.status === PaymentStatus.REFUNDED ||
                payment.status === PaymentStatus.PARTIALLY_REFUNDED
            ) {
                return PaymentMapper.toEntity(payment);
            }

            const amount = refundAmount ?? Number(payment.amount);
            const isPartial = amount < Number(payment.amount);

            const updated = await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: isPartial
                        ? PaymentStatus.PARTIALLY_REFUNDED
                        : PaymentStatus.REFUNDED,
                    refundId: gatewayRefundId || payment.refundId,
                    refundAmount: amount,
                    refundedAt: payment.refundedAt ?? new Date(),
                },
            });

            // Ensure booking is cancelled and slot is available
            await tx.booking.update({
                where: { id: payment.bookingId },
                data: {
                    status: BookingStatus.CANCELLED,
                    cancelledAt: new Date(),
                    cancelReason: 'Payment refunded via gateway',
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
                        heldByBookingId: null,
                        bookedAt: null,
                    },
                });
            }

            return PaymentMapper.toEntity(updated);
        });
    }

    async failRefundWebhook(gatewayPaymentIntentId: string, gatewayRefundId?: string, failureReason?: string,)
        : Promise<PaymentEntity | null> {
        const payment = await this._prisma.payment.findFirst({
            where: {
                OR: [
                    { gatewayId: gatewayPaymentIntentId },
                    ...(gatewayRefundId ? [{ refundId: gatewayRefundId }] : []),
                ],
            },
        });

        if (!payment) return null;

        const updated = await this._prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: PaymentStatus.SUCCEEDED,
                failureReason: `Refund failed: ${failureReason ?? 'Bank declined refund'}`,
            },
        });

        return PaymentMapper.toEntity(updated);
    }

    async findStudentPayments(studentId: string, query: PaymentListQuery,): Promise<PaginatedPaymentEntity> {
        return this._paginate({ studentId }, query);
    }

    async findAdminPayments(query: PaymentListQuery): Promise<PaginatedPaymentEntity> {
        return this._paginate({}, query);
    }

    private async _paginate(whereBase: Prisma.PaymentWhereInput, query: PaymentListQuery,): Promise<PaginatedPaymentEntity> {
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