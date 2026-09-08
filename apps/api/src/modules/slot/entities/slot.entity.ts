import { AvailabilityExceptionStatus, AvailabilityExceptionType, AvailabilityRuleStatus, SlotStatus } from '@prisma/client';

export class SlotRuleEntity {
    id!: string;
    profileId!: string;
    offeringId!: string;
    title!: string | null;
    weekday!: number;
    startMinute!: number;
    endMinute!: number;
    timezone!: string;
    slotDurationMinutes!: number;
    effectiveFrom!: Date;
    effectiveUntil!: Date | null;
    status!: AvailabilityRuleStatus;
    createdAt!: Date;
    updatedAt!: Date;
}

export class SlotExceptionEntity {
    id!: string;
    profileId!: string;
    offeringId!: string | null;
    type!: AvailabilityExceptionType;
    title!: string | null;
    startTime!: Date;
    endTime!: Date;
    timezone!: string;
    slotDurationMinutes!: number | null;
    status!: AvailabilityExceptionStatus;
    createdAt!: Date;
    updatedAt!: Date;
}

export class SlotEntity {
    id!: string;
    profileId!: string;
    offeringId!: string;
    ruleId!: string | null;
    exceptionId!: string | null;
    title!: string | null;
    startTime!: Date;
    endTime!: Date;
    timezone!: string;
    status!: SlotStatus;
    bookedAt!: Date | null;
    createdAt!: Date;
    updatedAt!: Date;
    offering?: {
        id: string;
        title: string | null;
        subcategory: { id: string; name: string };
    };
}

export class InstructorSlotAvailabilityEntity {
    rules!: SlotRuleEntity[];
    exceptions!: SlotExceptionEntity[];
    slots!: SlotEntity[];
}