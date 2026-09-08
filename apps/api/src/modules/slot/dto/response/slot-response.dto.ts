import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InstructorSlotAvailabilityEntity, SlotEntity, SlotExceptionEntity, SlotRuleEntity } from '../../entities/slot.entity';

export class SlotRuleDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    profileId!: string;

    @ApiProperty()
    offeringId!: string;

    @ApiPropertyOptional({ type: String, nullable: true })
    title!: string | null;

    @ApiProperty()
    weekday!: number;

    @ApiProperty()
    startMinute!: number;

    @ApiProperty()
    endMinute!: number;

    @ApiProperty()
    timezone!: string;

    @ApiProperty()
    slotDurationMinutes!: number;

    @ApiProperty()
    effectiveFrom!: Date;

    @ApiPropertyOptional({ type: Date, nullable: true })
    effectiveUntil!: Date | null;

    @ApiProperty()
    status!: string;

    static fromEntity(entity: SlotRuleEntity): SlotRuleDto {
        return { ...entity };
    }
}

export class SlotExceptionDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    profileId!: string;

    @ApiPropertyOptional({ type: String, nullable: true })
    offeringId!: string | null;

    @ApiProperty()
    type!: string;

    @ApiPropertyOptional({ type: String, nullable: true })
    title!: string | null;

    @ApiProperty()
    startTime!: Date;

    @ApiProperty()
    endTime!: Date;

    @ApiProperty()
    timezone!: string;

    @ApiPropertyOptional({ type: Number, nullable: true })
    slotDurationMinutes!: number | null;

    @ApiProperty()
    status!: string;

    static fromEntity(entity: SlotExceptionEntity): SlotExceptionDto {
        return { ...entity };
    }
}

export class SlotDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    profileId!: string;

    @ApiProperty()
    offeringId!: string;

    @ApiPropertyOptional({ type: String, nullable: true })
    ruleId!: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    exceptionId!: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    title!: string | null;

    @ApiProperty()
    startTime!: Date;

    @ApiProperty()
    endTime!: Date;

    @ApiProperty()
    timezone!: string;

    @ApiProperty()
    status!: string;

    static fromEntity(entity: SlotEntity): SlotDto {
        return {
            id: entity.id,
            profileId: entity.profileId,
            offeringId: entity.offeringId,
            ruleId: entity.ruleId,
            exceptionId: entity.exceptionId,
            title: entity.title,
            startTime: entity.startTime,
            endTime: entity.endTime,
            timezone: entity.timezone,
            status: entity.status,
        };
    }
}

export class InstructorSlotAvailabilityDto {
    @ApiProperty({ type: [SlotRuleDto] })
    rules!: SlotRuleDto[];

    @ApiProperty({ type: [SlotExceptionDto] })
    exceptions!: SlotExceptionDto[];

    @ApiProperty({ type: [SlotDto] })
    slots!: SlotDto[];

    static fromEntity(entity: InstructorSlotAvailabilityEntity): InstructorSlotAvailabilityDto {
        return {
            rules: entity.rules.map(SlotRuleDto.fromEntity),
            exceptions: entity.exceptions.map(SlotExceptionDto.fromEntity),
            slots: entity.slots.map(SlotDto.fromEntity),
        };
    }
}

export class InstructorSlotAvailabilityResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: InstructorSlotAvailabilityDto })
    data!: InstructorSlotAvailabilityDto;

    static fromEntity(message: string, entity: InstructorSlotAvailabilityEntity): InstructorSlotAvailabilityResponseDto {
        return {
            success: true,
            message,
            data: InstructorSlotAvailabilityDto.fromEntity(entity),
        };
    }
}

export class SlotRuleResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: SlotRuleDto })
    data!: SlotRuleDto;

    static fromEntity(message: string, entity: SlotRuleEntity): SlotRuleResponseDto {
        return { success: true, message, data: SlotRuleDto.fromEntity(entity) };
    }
}

export class SlotExceptionResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: SlotExceptionDto })
    data!: SlotExceptionDto;

    static fromEntity(message: string, entity: SlotExceptionEntity): SlotExceptionResponseDto {
        return { success: true, message, data: SlotExceptionDto.fromEntity(entity) };
    }
}

export class PublicSlotListResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: [SlotDto] })
    data!: SlotDto[];

    static fromEntities(message: string, entities: SlotEntity[]): PublicSlotListResponseDto {
        return {
            success: true,
            message,
            data: entities.map(SlotDto.fromEntity),
        };
    }
}