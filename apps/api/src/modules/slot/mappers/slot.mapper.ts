import { AvailabilityException, AvailabilityRule, AvailabilitySlot, InstructorOffering, Subcategory } from '@prisma/client';
import { InstructorSlotAvailabilityEntity, SlotEntity, SlotExceptionEntity, SlotRuleEntity } from '../entities/slot.entity';

type SlotWithOffering = AvailabilitySlot & {
    offering?: Pick<InstructorOffering, 'id' | 'title'> & {
        subcategory: Pick<Subcategory, 'id' | 'name'>;
    };
};

export class SlotMapper {
    static toRuleEntity(rule: AvailabilityRule): SlotRuleEntity {
        return { ...rule };
    }

    static toExceptionEntity(exception: AvailabilityException): SlotExceptionEntity {
        return { ...exception };
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
            status: slot.status,
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