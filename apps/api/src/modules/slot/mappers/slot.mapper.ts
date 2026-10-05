import { AvailabilityException, AvailabilityRule, AvailabilitySlot, InstructorOffering, Subcategory } from '@prisma/client';
import { InstructorSlotAvailabilityEntity, SlotEntity, SlotExceptionEntity, SlotRuleEntity } from '../entities/slot.entity';
import { AvailabilityExceptionStatus, AvailabilityExceptionType, AvailabilityRuleStatus, SlotStatus } from '../enums/slot.enum';

type OfferingRelation = (Pick<InstructorOffering, 'id' | 'title'> & {
    subcategory: Pick<Subcategory, 'id' | 'name'>;
}) | null;

type RuleWithOffering = AvailabilityRule & {
    offering?: OfferingRelation;
};

type ExceptionWithOffering = AvailabilityException & {
    offering?: OfferingRelation;
};

type SlotWithOffering = AvailabilitySlot & {
    offering?: OfferingRelation;
};

export class SlotMapper {
    static toRuleEntity(rule: RuleWithOffering): SlotRuleEntity {
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
            offering: rule.offering
                ? {
                    id: rule.offering.id,
                    title: rule.offering.title,
                    subcategory: {
                        id: rule.offering.subcategory.id,
                        name: rule.offering.subcategory.name,
                    },
                }
                : undefined,
        };
    }

    static toExceptionEntity(exception: ExceptionWithOffering): SlotExceptionEntity {
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
            offering: exception.offering
                ? {
                    id: exception.offering.id,
                    title: exception.offering.title,
                    subcategory: {
                        id: exception.offering.subcategory.id,
                        name: exception.offering.subcategory.name,
                    },
                }
                : undefined,
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
            heldUntil: slot.heldUntil,
            heldByUserId: slot.heldByUserId,
            bookedAt: slot.bookedAt,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt,
            offering: slot.offering
                ? {
                    id: slot.offering.id,
                    title: slot.offering.title,
                    subcategory: {
                        id: slot.offering.subcategory.id,
                        name: slot.offering.subcategory.name,
                    },
                }
                : undefined,
        };
    }

    static toInstructorAvailabilityEntity(input: {
        rules: RuleWithOffering[];
        exceptions: ExceptionWithOffering[];
        slots: SlotWithOffering[];
    }): InstructorSlotAvailabilityEntity {
        return {
            rules: input.rules.map(SlotMapper.toRuleEntity),
            exceptions: input.exceptions.map(SlotMapper.toExceptionEntity),
            slots: input.slots.map(SlotMapper.toSlotEntity),
        };
    }
}