import { AvailabilityExceptionType, AvailabilityRuleStatus, SlotStatus } from "../enums/slot.enum";

export type CreateSlotRuleInput = {
    profileId: string;
    offeringId: string;
    title?: string | null;
    weekday: number;
    startMinute: number;
    endMinute: number;
    timezone?: string;
    slotDurationMinutes: number;
    effectiveFrom: Date;
    effectiveUntil?: Date | null;
};

export type UpdateSlotRuleInput = {
    title?: string | null;
    startMinute?: number;
    endMinute?: number;
    slotDurationMinutes?: number;
    effectiveUntil?: Date | null;
    status?: AvailabilityRuleStatus;
};

export type CreateSlotExceptionInput = {
    profileId: string;
    offeringId?: string | null;
    type: AvailabilityExceptionType;
    title?: string | null;
    startTime: Date;
    endTime: Date;
    timezone: string;
    slotDurationMinutes?: number | null;
};

export type CreateSlotInput = {
    profileId: string;
    offeringId: string;
    ruleId?: string;
    exceptionId?: string;
    title?: string | null;
    startTime: Date;
    endTime: Date;
    timezone: string;
    status: SlotStatus;
};

export type CreateSlotExceptionCommand = {
    type: AvailabilityExceptionType;
    offeringId?: string;
    title?: string;
    startTime: string;
    endTime: string;
    timezone?: string;
    slotDurationMinutes?: number;
};