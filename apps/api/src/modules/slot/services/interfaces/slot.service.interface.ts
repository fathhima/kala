import { CreateSlotExceptionDto, CreateSlotRuleDto, SlotAvailabilityQueryDto, UpdateSlotRuleDto } from '../../dto/request/slot.request.dto';
import { InstructorSlotAvailabilityEntity, SlotEntity, SlotExceptionEntity, SlotRuleEntity } from '../../entities/slot.entity';

export const SLOT_SERVICE = Symbol('SLOT_SERVICE');

export interface ISlotService {
  getInstructorAvailability(userId: string, query: SlotAvailabilityQueryDto): Promise<InstructorSlotAvailabilityEntity>;
  createRule(userId: string, dto: CreateSlotRuleDto): Promise<SlotRuleEntity>;
  updateRule(userId: string, ruleId: string, dto: UpdateSlotRuleDto): Promise<SlotRuleEntity>;
  disableRule(userId: string, ruleId: string): Promise<void>;
  createException(userId: string, dto: CreateSlotExceptionDto): Promise<SlotExceptionEntity>;
  getPublicAvailability(profileId: string, query: SlotAvailabilityQueryDto): Promise<SlotEntity[]>;
}