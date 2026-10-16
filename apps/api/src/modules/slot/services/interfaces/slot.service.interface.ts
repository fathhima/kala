import { CreateSlotExceptionDto, CreateSlotRuleDto, SlotAvailabilityQueryDto, UpdateSlotRuleDto } from '../../dto/request/slot.request.dto';
import { InstructorSlotAvailabilityResponseDto, PublicSlotListResponseDto, SlotExceptionResponseDto, SlotRuleResponseDto } from '../../dto/response/slot-response.dto';
import { MessageResponseDto } from '@/shared/dto/response/message-response.dto';

export const SLOT_SERVICE = Symbol('SLOT_SERVICE');

export interface ISlotService {
  getInstructorAvailability(userId: string, query: SlotAvailabilityQueryDto): Promise<InstructorSlotAvailabilityResponseDto>;
  createRule(userId: string, dto: CreateSlotRuleDto): Promise<SlotRuleResponseDto>;
  updateRule(userId: string, ruleId: string, dto: UpdateSlotRuleDto): Promise<SlotRuleResponseDto>;
  disableRule(userId: string, ruleId: string): Promise<void>;
  deleteRule(userId: string, ruleId: string): Promise<MessageResponseDto>;
  createException(userId: string, dto: CreateSlotExceptionDto): Promise<SlotExceptionResponseDto>;
  deleteException(userId: string, exceptionId: string): Promise<MessageResponseDto>;
  getPublicAvailability(profileId: string, query: SlotAvailabilityQueryDto): Promise<PublicSlotListResponseDto>;
}
