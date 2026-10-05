import { InstructorSlotAvailabilityEntity, SlotEntity, SlotExceptionEntity, SlotRuleEntity } from '../../entities/slot.entity';
import { CreateSlotExceptionInput, CreateSlotInput, CreateSlotRuleInput, UpdateSlotRuleInput } from '../../types/slot.type';

export const SLOT_REPOSITORY = Symbol('SLOT_REPOSITORY');

export interface ISlotRepository {
    createRule(data: CreateSlotRuleInput): Promise<SlotRuleEntity>;

    updateRule(ruleId: string, data: UpdateSlotRuleInput): Promise<SlotRuleEntity>;

    findOwnedRule(profileId: string, ruleId: string): Promise<SlotRuleEntity | null>;

    findOwnedActiveRule(profileId: string, ruleId: string): Promise<SlotRuleEntity | null>;

    findRulesByWeekday(profileId: string, weekday: number): Promise<SlotRuleEntity[]>;

    findActiveRulesByProfile(profileId: string): Promise<SlotRuleEntity[]>;

    deleteRule(ruleId: string): Promise<void>;

    createException(data: CreateSlotExceptionInput): Promise<SlotExceptionEntity>;

    findOwnedException(profileId: string, exceptionId: string): Promise<SlotExceptionEntity | null>;

    findOverlappingBlockException(input: {
        profileId: string;
        offeringId?: string;
        startTime: Date;
        endTime: Date;
    }): Promise<SlotExceptionEntity | null>;

    findActiveBlockExceptionsInRange(input: {
        profileId: string;
        offeringId?: string;
        from: Date;
        to: Date;
    }): Promise<SlotExceptionEntity[]>;

    deleteException(exceptionId: string): Promise<void>;

    createSlots(data: CreateSlotInput[]): Promise<void>;

    cancelFutureAvailableSlotsByRule(ruleId: string): Promise<void>;

    deleteUnbookedFutureSlotsByRule(ruleId: string): Promise<void>;

    deleteUnbookedSlotsByException(exceptionId: string): Promise<void>;

    cancelAvailableSlotsInRange(input: {
        profileId: string;
        offeringId?: string;
        startTime: Date;
        endTime: Date;
    }): Promise<void>;

    findActiveSlotsInRange(input: {
        profileId: string;
        from: Date;
        to: Date;
    }): Promise<SlotEntity[]>;

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