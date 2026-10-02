import { Prisma } from '@prisma/client';
import { PaymentEntity, PaginatedPaymentEntity } from '../entities/payment.entity';
import { PaymentStatus, PaymentGateway } from '../enums/payment.enum';

export const paymentInclude = {} satisfies Prisma.PaymentInclude;

export type PaymentRecord = Prisma.PaymentGetPayload<{ include: typeof paymentInclude }>;

export class PaymentMapper {
    static toEntity(record: PaymentRecord): PaymentEntity {
        const entity = new PaymentEntity();
        entity.id = record.id;
        entity.bookingId = record.bookingId;
        entity.studentId = record.studentId;
        entity.amount = Number(record.amount);
        entity.currency = record.currency;
        entity.status = record.status as PaymentStatus;
        entity.gateway = record.gateway as PaymentGateway;
        entity.gatewayId = record.gatewayId;
        entity.gatewaySessionId = record.gatewaySessionId;
        entity.refundId = record.refundId;
        entity.refundAmount = record.refundAmount ? Number(record.refundAmount) : null;
        entity.metadata = record.metadata as Record<string, unknown> | null;
        entity.failureReason = record.failureReason;
        entity.paidAt = record.paidAt;
        entity.refundedAt = record.refundedAt;
        entity.createdAt = record.createdAt;
        entity.updatedAt = record.updatedAt;
        return entity;
    }

    static toPaginated(
        records: PaymentRecord[], total: number, page: number, limit: number,
    ): PaginatedPaymentEntity {
        const entity = new PaginatedPaymentEntity();
        entity.items = records.map(PaymentMapper.toEntity);
        entity.total = total;
        entity.page = page;
        entity.limit = limit;
        return entity;
    }
}