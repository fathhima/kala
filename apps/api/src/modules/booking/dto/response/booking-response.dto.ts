import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingEntity, PaginatedBookingEntity } from '../../entities/booking.entity';
import { BookingStatus } from '../../enums/booking.enum';
import { SlotStatus } from '@/modules/slot/enums/slot.enum';

export class BookingStudentDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    email!: string;

    @ApiPropertyOptional({ nullable: true })
    imageUrl!: string | null;
}

export class BookingInstructorDto {
    @ApiProperty()
    profileId!: string;

    @ApiProperty()
    userId!: string;

    @ApiProperty()
    name!: string;

    @ApiPropertyOptional({ nullable: true })
    imageUrl!: string | null;
}

export class BookingOfferingDto {
    @ApiProperty()
    id!: string;

    @ApiPropertyOptional({ nullable: true })
    title!: string | null;

    @ApiProperty({ example: 1500 })
    hourlyRate!: number;

    @ApiProperty({ example: 'INR' })
    currency!: string;

    @ApiProperty({ example: { id: 'sub_1', name: 'Portrait' } })
    subcategory!: { id: string; name: string };
}

export class BookingSlotDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    startTime!: string;

    @ApiProperty()
    endTime!: string;

    @ApiProperty({ example: 'Asia/Kolkata' })
    timezone!: string;

    @ApiPropertyOptional({ nullable: true })
    title!: string | null;

    @ApiProperty({ enum: SlotStatus })
    status!: SlotStatus;

    @ApiPropertyOptional({ nullable: true })
    heldUntil!: string | null;
}

export class BookingDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    slotId!: string;

    @ApiProperty()
    studentId!: string;

    @ApiProperty()
    offeringId!: string;

    @ApiProperty()
    profileId!: string;

    @ApiProperty({ enum: BookingStatus })
    status!: BookingStatus;

    @ApiProperty({ example: 1500 })
    amount!: number;

    @ApiProperty({ example: 'INR' })
    currency!: string;

    @ApiProperty()
    hourlyRate!: number;

    @ApiProperty()
    durationMinutes!: number;

    @ApiProperty()
    holdExpiresAt!: string;

    @ApiPropertyOptional({ type: String, nullable: true })
    cancelledAt!: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    cancelledBy!: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    cancelReason!: string | null;

    @ApiProperty()
    createdAt!: string;

    @ApiProperty()
    updatedAt!: string;

    @ApiProperty({ type: BookingSlotDto })
    slot!: BookingSlotDto;

    @ApiProperty({ type: BookingStudentDto })
    student!: BookingStudentDto;

    @ApiProperty({ type: BookingOfferingDto })
    offering!: BookingOfferingDto;

    @ApiProperty({ type: BookingInstructorDto })
    instructor!: BookingInstructorDto;

    static fromEntity(entity: BookingEntity): BookingDto {
        const dto = new BookingDto();
        dto.id = entity.id;
        dto.slotId = entity.slotId;
        dto.studentId = entity.studentId;
        dto.offeringId = entity.offeringId;
        dto.profileId = entity.profileId;
        dto.status = entity.status;
        dto.amount = entity.amount;
        dto.currency = entity.currency;
        dto.hourlyRate = entity.hourlyRate;
        dto.durationMinutes = entity.durationMinutes;
        dto.holdExpiresAt = entity.holdExpiresAt.toISOString();
        dto.cancelledAt = entity.cancelledAt?.toISOString() ?? null;
        dto.cancelledBy = entity.cancelledBy;
        dto.cancelReason = entity.cancelReason;
        dto.createdAt = entity.createdAt.toISOString();
        dto.updatedAt = entity.updatedAt.toISOString();
        dto.slot = {
            id: entity.slot.id,
            startTime: entity.slot.startTime.toISOString(),
            endTime: entity.slot.endTime.toISOString(),
            timezone: entity.slot.timezone,
            title: entity.slot.title,
            status: entity.slot.status,
            heldUntil: entity.slot.heldUntil?.toISOString() ?? null,
        };
        dto.student = { ...entity.student };
        dto.offering = { ...entity.offering };
        dto.instructor = { ...entity.instructor };
        return dto;
    }
}

export class BookingResponseDto {
    @ApiProperty({ example: 'Slot held successfully' })
    message!: string;

    @ApiProperty({ type: BookingDto })
    data!: BookingDto;

    static fromEntity(message: string, entity: BookingEntity): BookingResponseDto {
        const dto = new BookingResponseDto();
        dto.message = message;
        dto.data = BookingDto.fromEntity(entity);
        return dto;
    }
}

export class BookingPaginationMetaDto {
    @ApiProperty()
    page!: number;

    @ApiProperty()
    limit!: number;

    @ApiProperty()
    total!: number;

    @ApiProperty()
    totalPages!: number;
}

export class PaginatedBookingsDataDto {
    @ApiProperty({ type: [BookingDto] })
    items!: BookingDto[];

    @ApiProperty({ type: BookingPaginationMetaDto })
    meta!: BookingPaginationMetaDto;
}

export class PaginatedBookingsResponseDto {
    @ApiProperty({ example: 'Bookings fetched successfully' })
    message!: string;

    @ApiProperty({ type: PaginatedBookingsDataDto })
    data!: PaginatedBookingsDataDto;

    static fromEntity(message: string, entity: PaginatedBookingEntity): PaginatedBookingsResponseDto {
        const dto = new PaginatedBookingsResponseDto();
        dto.message = message;
        dto.data = {
            items: entity.items.map(BookingDto.fromEntity),
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