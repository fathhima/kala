import { AvailabilityException, AvailabilityRule, AvailabilitySlot, InstructorOffering, Subcategory } from '@prisma/client';
import { InstructorSlotAvailabilityEntity, SlotEntity, SlotExceptionEntity, SlotRuleEntity } from '../entities/slot.entity';
import { AvailabilityExceptionStatus, AvailabilityExceptionType, AvailabilityRuleStatus, SlotStatus } from '../enums/slot.enum';

type SlotWithOffering = AvailabilitySlot & {
    offering?: Pick<InstructorOffering, 'id' | 'title'> & {
        subcategory: Pick<Subcategory, 'id' | 'name'>;
    };
};

export class SlotMapper {
    static toRuleEntity(rule: AvailabilityRule): SlotRuleEntity {
        return {
            id: rule.id,
            profileId: rule.profileId,
            offeringId: rule.offeringId,
            title: rule.title,
            weekday: rule.weekday,
            startMinute: rule.startMinute,
            endMinute: rule.endMinute,
            timezone: rule.timezone,
            slotDurationMinutes: rule.slotDurationMinutes,
            effectiveFrom: rule.effectiveFrom,
            effectiveUntil: rule.effectiveUntil,
            status: rule.status as AvailabilityRuleStatus,
            createdAt: rule.createdAt,
            updatedAt: rule.updatedAt,
        };
    }

    static toExceptionEntity(exception: AvailabilityException): SlotExceptionEntity {
        return {
            id: exception.id,
            profileId: exception.profileId,
            offeringId: exception.offeringId,
            type: exception.type as AvailabilityExceptionType,
            title: exception.title,
            startTime: exception.startTime,
            endTime: exception.endTime,
            timezone: exception.timezone,
            slotDurationMinutes: exception.slotDurationMinutes,
            status: exception.status as AvailabilityExceptionStatus,
            createdAt: exception.createdAt,
            updatedAt: exception.updatedAt,
        };
    }

    static toSlotEntity(slot: SlotWithOffering): SlotEntity {
        return {
            id: slot.id,
            profileId: slot.profileId,
            offeringId: slot.offeringId,
            ruleId: slot.ruleId,
            exceptionId: slot.exceptionId,
            title: slot.title,
            startTime: slot.startTime,
            endTime: slot.endTime,
            timezone: slot.timezone,
            status: slot.status as SlotStatus,
            bookedAt: slot.bookedAt,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt,
        };
    }

    static toInstructorAvailabilityEntity(input: {
        rules: AvailabilityRule[];
        exceptions: AvailabilityException[];
        slots: SlotWithOffering[];
    }): InstructorSlotAvailabilityEntity {
        return {
            rules: input.rules.map(SlotMapper.toRuleEntity),
            exceptions: input.exceptions.map(SlotMapper.toExceptionEntity),
            slots: input.slots.map(SlotMapper.toSlotEntity),
        };
    }
}