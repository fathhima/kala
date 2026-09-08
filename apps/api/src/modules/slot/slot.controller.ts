import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { Public } from '@/shared/decorators/public.decorator';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserId } from '@/shared/decorators/user-id.decorator';
import { UserRole } from '@/shared/enums/role.enum';
import { MessageResponseDto } from '@/shared/dto/response/message-response.dto';
import { type ISlotService, SLOT_SERVICE } from './services/interfaces/slot.service.interface';
import { CreateSlotExceptionDto, CreateSlotRuleDto, SlotAvailabilityQueryDto, UpdateSlotRuleDto } from './dto/request/slot.request.dto';
import { InstructorSlotAvailabilityResponseDto, PublicSlotListResponseDto, SlotExceptionResponseDto, SlotRuleResponseDto } from './dto/response/slot-response.dto';

@Controller()
export class SlotController {
    constructor(
        @Inject(SLOT_SERVICE)
        private readonly _slotService: ISlotService,
    ) { }

    @Get('instructor/availability')
    @Roles(UserRole.INSTRUCTOR)
    async listInstructorAvailability(@UserId() userId: string, @Query() query: SlotAvailabilityQueryDto) {
        const availability = await this._slotService.getInstructorAvailability(userId, query);
        return InstructorSlotAvailabilityResponseDto.fromEntity('Instructor availability fetched successfully', availability);
    }

    @Post('instructor/availability/rules')
    @Roles(UserRole.INSTRUCTOR)
    async createRule(@UserId() userId: string, @Body() dto: CreateSlotRuleDto) {
        const rule = await this._slotService.createRule(userId, dto);
        return SlotRuleResponseDto.fromEntity('Availability rule created successfully', rule);
    }

    @Patch('instructor/availability/rules/:ruleId')
    @Roles(UserRole.INSTRUCTOR)
    async updateRule(@UserId() userId: string, @Param('ruleId') ruleId: string, @Body() dto: UpdateSlotRuleDto) {
        const rule = await this._slotService.updateRule(userId, ruleId, dto);
        return SlotRuleResponseDto.fromEntity('Availability rule updated successfully', rule);
    }

    @Delete('instructor/availability/rules/:ruleId')
    @Roles(UserRole.INSTRUCTOR)
    @HttpCode(HttpStatus.OK)
    async disableRule(@UserId() userId: string, @Param('ruleId') ruleId: string) {
        await this._slotService.disableRule(userId, ruleId);
        return MessageResponseDto.success('Availability rule disabled successfully');
    }

    @Post('instructor/availability/exceptions')
    @Roles(UserRole.INSTRUCTOR)
    async createException(@UserId() userId: string, @Body() dto: CreateSlotExceptionDto) {
        const exception = await this._slotService.createException(userId, dto);
        return SlotExceptionResponseDto.fromEntity('Availability exception created successfully', exception);
    }

    @Public()
    @Get('public/instructors/:profileId/availability')
    async getPublicAvailability(@Param('profileId') profileId: string, @Query() query: SlotAvailabilityQueryDto) {
        const slots = await this._slotService.getPublicAvailability(profileId, query);
        return PublicSlotListResponseDto.fromEntities('Public availability fetched successfully', slots);
    }
}