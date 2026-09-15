import { InstructorSlotAvailabilityEntity, SlotEntity, SlotExceptionEntity, SlotRuleEntity } from '../../entities/slot.entity';
import { SlotAvailabilityQueryInput } from '../../types/slot-availability-query.type';
import { CreateSlotRuleInput, UpdateSlotRuleInput } from '../../types/slot.type';

export const SLOT_SERVICE = Symbol('SLOT_SERVICE');

export interface ISlotService {
  getInstructorAvailability(userId: string, query: SlotAvailabilityQueryInput): Promise<InstructorSlotAvailabilityEntity>;

  createRule(userId: string, input: Omit<CreateSlotRuleInput, 'profileId'>): Promise<SlotRuleEntity>;

  updateRule(userId: string, ruleId: string, input: UpdateSlotRuleInput & { title?: string | null; effectiveUntil?: Date | null }): Promise<SlotRuleEntity>;

  disableRule(userId: string, ruleId: string): Promise<void>;

  createException(userId: string, input: CreateSlotExceptionCommand): Promise<SlotExceptionEntity>;

  getPublicAvailability(profileId: string, query: SlotAvailabilityQueryInput): Promise<SlotEntity[]>;
}

export type CreateSlotExceptionCommand = {
  type: import('../../enums/slot.enum').AvailabilityExceptionType;
  offeringId?: string;
  title?: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  slotDurationMinutes?: number;
};