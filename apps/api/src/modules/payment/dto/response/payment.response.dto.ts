import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    CheckoutEntity, PaymentEntity, PaginatedPaymentEntity,
} from '../../entities/payment.entity';
import { PaymentStatus, PaymentGateway } from '../../enums/payment.enum';

export class PaymentDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    bookingId!: string;

    @ApiProperty()
    studentId!: string;

    @ApiProperty({ example: 1500 })
    amount!: number;

    @ApiProperty({ example: 'INR' })
    currency!: string;

    @ApiProperty({ enum: PaymentStatus })
    status!: PaymentStatus;

    @ApiProperty({ enum: PaymentGateway })
    gateway!: PaymentGateway;

    @ApiPropertyOptional({ nullable: true })
    gatewayId!: string | null;

    @ApiPropertyOptional({ nullable: true })
    refundId!: string | null;

    @ApiPropertyOptional({ nullable: true, example: 1500 })
    refundAmount!: number | null;

    @ApiPropertyOptional({ nullable: true })
    failureReason!: string | null;

    @ApiPropertyOptional({ nullable: true })
    paidAt!: string | null;

    @ApiPropertyOptional({ nullable: true })
    refundedAt!: string | null;

    @ApiProperty()
    createdAt!: string;

    @ApiProperty()
    updatedAt!: string;

    static fromEntity(entity: PaymentEntity): PaymentDto {
        const dto = new PaymentDto();
        dto.id = entity.id;
        dto.bookingId = entity.bookingId;
        dto.studentId = entity.studentId;
        dto.amount = entity.amount;
        dto.currency = entity.currency;
        dto.status = entity.status;
        dto.gateway = entity.gateway;
        dto.gatewayId = entity.gatewayId;
        dto.refundId = entity.refundId;
        dto.refundAmount = entity.refundAmount;
        dto.failureReason = entity.failureReason;
        dto.paidAt = entity.paidAt?.toISOString() ?? null;
        dto.refundedAt = entity.refundedAt?.toISOString() ?? null;
        dto.createdAt = entity.createdAt.toISOString();
        dto.updatedAt = entity.updatedAt.toISOString();
        return dto;
    }
}

export class CheckoutResponseDto {
    @ApiProperty({ example: 'Checkout session created successfully' })
    message!: string;

    @ApiProperty()
    data!: {
        paymentId: string;
        checkoutUrl: string;
        sessionId: string;
        gatewayKeyId: string;
    };

    static fromEntity(message: string, entity: CheckoutEntity): CheckoutResponseDto {
        const dto = new CheckoutResponseDto();
        dto.message = message;
        dto.data = {
            paymentId: entity.paymentId,
            checkoutUrl: entity.checkoutUrl,
            sessionId: entity.sessionId,
            gatewayKeyId: entity.gatewayKeyId
        };
        return dto;
    }
}

export class PaymentResponseDto {
    @ApiProperty({ example: 'Payment fetched successfully' })
    message!: string;

    @ApiProperty({ type: PaymentDto })
    data!: PaymentDto;

    static fromEntity(message: string, entity: PaymentEntity): PaymentResponseDto {
        const dto = new PaymentResponseDto();
        dto.message = message;
        dto.data = PaymentDto.fromEntity(entity);
        return dto;
    }
}

export class PaymentPaginationMetaDto {
    @ApiProperty()
    page!: number;

    @ApiProperty()
    limit!: number;

    @ApiProperty()
    total!: number;

    @ApiProperty()
    totalPages!: number;
}

export class PaginatedPaymentsDataDto {
    @ApiProperty({ type: [PaymentDto] })
    items!: PaymentDto[];

    @ApiProperty({ type: PaymentPaginationMetaDto })
    meta!: PaymentPaginationMetaDto;
}

export class PaginatedPaymentsResponseDto {
    @ApiProperty({ example: 'Payments fetched successfully' })
    message!: string;

    @ApiProperty({ type: PaginatedPaymentsDataDto })
    data!: PaginatedPaymentsDataDto;

    static fromEntity(
        message: string, entity: PaginatedPaymentEntity,
    ): PaginatedPaymentsResponseDto {
        const dto = new PaginatedPaymentsResponseDto();
        dto.message = message;
        dto.data = {
            items: entity.items.map(PaymentDto.fromEntity),
            meta: {
                page: entity.page,
                limit: entity.limit,
                total: entity.total,
                totalPages: Math.ceil(entity.total / entity.limit) || 0,
            },
        };
        return dto;
    }
}