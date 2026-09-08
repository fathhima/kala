import { Prisma } from '@prisma/client';
import { InstructorSlotAvailabilityEntity, SlotEntity, SlotExceptionEntity, SlotRuleEntity } from '../../entities/slot.entity';

export const SLOT_REPOSITORY = Symbol('SLOT_REPOSITORY');

export interface ISlotRepository {
    findApprovedProfileByUserId(userId: string): Promise<{ id: string } | null>;

    findApprovedOfferingForProfile(profileId: string, offeringId: string): Promise<{ id: string } | null>;

    createRule(data: Prisma.AvailabilityRuleUncheckedCreateInput): Promise<SlotRuleEntity>;

    updateRule(ruleId: string, data: Prisma.AvailabilityRuleUpdateInput): Promise<SlotRuleEntity>;

    findOwnedActiveRule(profileId: string, ruleId: string): Promise<SlotRuleEntity | null>;

    createException(data: Prisma.AvailabilityExceptionUncheckedCreateInput): Promise<SlotExceptionEntity>;

    createSlots(data: Prisma.AvailabilitySlotCreateManyInput[]): Promise<void>;

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