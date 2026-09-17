import { InstructorSlotAvailabilityEntity, SlotEntity, SlotExceptionEntity, SlotRuleEntity } from '../../entities/slot.entity';
import { CreateSlotExceptionInput, CreateSlotInput, CreateSlotRuleInput, UpdateSlotRuleInput } from '../../types/slot.type';

export const SLOT_REPOSITORY = Symbol('SLOT_REPOSITORY');

export interface ISlotRepository {
    createRule(data: CreateSlotRuleInput): Promise<SlotRuleEntity>;

    updateRule(ruleId: string, data: UpdateSlotRuleInput): Promise<SlotRuleEntity>;

    findOwnedActiveRule(profileId: string, ruleId: string): Promise<SlotRuleEntity | null>;

    createException(data: CreateSlotExceptionInput): Promise<SlotExceptionEntity>;

    createSlots(data: CreateSlotInput[]): Promise<void>;

    cancelFutureAvailableSlotsByRule(ruleId: string): Promise<void>;

    cancelAvailableSlotsInRange(input: {
        profileId: string;
        offeringId?: string;
        startTime: Date;
        endTime: Date;
    }): Promise<void>;

    findInstructorAvailability(input: {
        profileId: string;
        offeringId?: string;
        from: Date;
        to: Date;
    }): Promise<InstructorSlotAvailabilityEntity>;

    findPublicSlots(input: {
        profileId: string;
        offeringId?: string;
        from: Date;
        to: Date;
    }): Promise<SlotEntity[]>;
}