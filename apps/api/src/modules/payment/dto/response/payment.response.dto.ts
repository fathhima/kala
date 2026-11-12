import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    CheckoutEntity,
    InstructorPaymentItemEntity,
    InstructorPaymentSummaryEntity,
    InstructorPaymentsPageEntity,
    PaymentEntity,
    PaginatedPaymentEntity,
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

    @ApiPropertyOptional({ type: String, nullable: true })
    gatewayId!: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    gatewaySessionId!: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    refundId!: string | null;

    @ApiPropertyOptional({ type: Number, nullable: true, example: 1500 })
    refundAmount!: number | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    failureReason!: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    paidAt!: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
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
        dto.gatewaySessionId = entity.gatewaySessionId;
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

    static fromEntity(message: string, entity: PaginatedPaymentEntity,): PaginatedPaymentsResponseDto {
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

export class InstructorPaymentStudentDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiPropertyOptional({ type: String, nullable: true })
    imageUrl!: string | null;
}

export class InstructorPaymentSummaryDto {
    @ApiProperty()
    totalEarned!: number;

    @ApiProperty()
    paidCount!: number;

    @ApiProperty()
    thisMonthEarned!: number;

    @ApiProperty()
    totalRefunded!: number;

    @ApiProperty()
    refundedCount!: number;

    @ApiProperty()
    pendingAmount!: number;

    @ApiProperty()
    pendingCount!: number;

    static fromEntity(entity: InstructorPaymentSummaryEntity): InstructorPaymentSummaryDto {
        const dto = new InstructorPaymentSummaryDto();
        dto.totalEarned = entity.totalEarned;
        dto.paidCount = entity.paidCount;
        dto.thisMonthEarned = entity.thisMonthEarned;
        dto.totalRefunded = entity.totalRefunded;
        dto.refundedCount = entity.refundedCount;
        dto.pendingAmount = entity.pendingAmount;
        dto.pendingCount = entity.pendingCount;
        return dto;
    }
}

export class InstructorPaymentItemDto extends PaymentDto {
    @ApiProperty()
    bookingStatus!: string;

    @ApiProperty()
    offeringTitle!: string;

    @ApiProperty()
    slotStartTime!: string;

    @ApiProperty()
    slotEndTime!: string;

    @ApiProperty()
    durationMinutes!: number;

    @ApiProperty({ type: InstructorPaymentStudentDto })
    student!: InstructorPaymentStudentDto;

    static fromInstructorEntity(entity: InstructorPaymentItemEntity): InstructorPaymentItemDto {
        const dto = Object.assign(
            new InstructorPaymentItemDto(),
            PaymentDto.fromEntity(entity),
        );
        dto.bookingStatus = entity.bookingStatus;
        dto.offeringTitle = entity.offeringTitle;
        dto.slotStartTime = entity.slotStartTime.toISOString();
        dto.slotEndTime = entity.slotEndTime.toISOString();
        dto.durationMinutes = entity.durationMinutes;
        dto.student = { ...entity.student };
        return dto;
    }
}

export class InstructorPaymentsDataDto {
    @ApiProperty({ type: InstructorPaymentSummaryDto })
    summary!: InstructorPaymentSummaryDto;

    @ApiProperty({ type: [InstructorPaymentItemDto] })
    items!: InstructorPaymentItemDto[];

    @ApiProperty({ type: PaymentPaginationMetaDto })
    meta!: PaymentPaginationMetaDto;
}

export class InstructorPaymentsResponseDto {
    @ApiProperty({ example: 'Instructor payments fetched successfully' })
    message!: string;

    @ApiProperty({ type: InstructorPaymentsDataDto })
    data!: InstructorPaymentsDataDto;

    static fromEntity(
        message: string,
        entity: InstructorPaymentsPageEntity,
    ): InstructorPaymentsResponseDto {
        const dto = new InstructorPaymentsResponseDto();
        dto.message = message;
        dto.data = {
            summary: InstructorPaymentSummaryDto.fromEntity(entity.summary),
            items: entity.items.map(InstructorPaymentItemDto.fromInstructorEntity),
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