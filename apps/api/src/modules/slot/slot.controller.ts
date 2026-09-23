import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { Public } from '@/shared/decorators/public.decorator';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserId } from '@/shared/decorators/user-id.decorator';
import { UserRole } from '@/shared/enums/role.enum';
import { MessageResponseDto } from '@/shared/dto/response/message-response.dto';
import { type ISlotService, SLOT_SERVICE } from './services/interfaces/slot.service.interface';
import { CreateSlotExceptionDto, CreateSlotRuleDto, SlotAvailabilityQueryDto, UpdateSlotRuleDto } from './dto/request/slot.request.dto';
import { InstructorSlotAvailabilityResponseDto, PublicSlotListResponseDto, SlotExceptionResponseDto, SlotRuleResponseDto } from './dto/response/slot-response.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Slots')
@Controller()
export class SlotController {
    constructor(
        @Inject(SLOT_SERVICE)
        private readonly _slotService: ISlotService,
    ) { }

    @Get('instructor/availability')
    @Roles(UserRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Get instructor availability rules and exceptions' })
    @ApiOkResponse({ type: InstructorSlotAvailabilityResponseDto })
    async listInstructorAvailability(@UserId() userId: string, @Query() query: SlotAvailabilityQueryDto) {
        const availability = await this._slotService.getInstructorAvailability(userId, {
            offeringId: query.offeringId,
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
        });

        return InstructorSlotAvailabilityResponseDto.fromEntity('Instructor availability fetched successfully', availability);
    }

    @Post('instructor/availability/rules')
    @Roles(UserRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Create a new availability rule' })
    @ApiCreatedResponse({ type: SlotRuleResponseDto })
    async createRule(@UserId() userId: string, @Body() dto: CreateSlotRuleDto) {
        const rule = await this._slotService.createRule(userId, {
            offeringId: dto.offeringId,
            title: dto.title,
            weekday: dto.weekday,
            startMinute: dto.startMinute,
            endMinute: dto.endMinute,
            timezone: dto.timezone,
            slotDurationMinutes: dto.slotDurationMinutes,
            effectiveFrom: new Date(dto.effectiveFrom),
            effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : null,
        });

        return SlotRuleResponseDto.fromEntity('Availability rule created successfully', rule);
    }

    @Patch('instructor/availability/rules/:ruleId')
    @Roles(UserRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Update an existing availability rule' })
    @ApiOkResponse({ type: SlotRuleResponseDto })
    async updateRule(@UserId() userId: string, @Param('ruleId') ruleId: string, @Body() dto: UpdateSlotRuleDto) {
        const rule = await this._slotService.updateRule(userId, ruleId, {
            title: dto.title,
            startMinute: dto.startMinute,
            endMinute: dto.endMinute,
            slotDurationMinutes: dto.slotDurationMinutes,
            effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : null,
        });

        return SlotRuleResponseDto.fromEntity('Availability rule updated successfully', rule);
    }

    @Delete('instructor/availability/rules/:ruleId')
    @Roles(UserRole.INSTRUCTOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Disable an availability rule' })
    @ApiOkResponse({ type: MessageResponseDto })
    async disableRule(@UserId() userId: string, @Param('ruleId') ruleId: string) {
        await this._slotService.disableRule(userId, ruleId);

        return MessageResponseDto.success('Availability rule disabled successfully');
    }

    @Post('instructor/availability/exceptions')
    @Roles(UserRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Create an availability exception' })
    @ApiCreatedResponse({ type: SlotExceptionResponseDto })
    async createException(@UserId() userId: string, @Body() dto: CreateSlotExceptionDto) {
        const exception = await this._slotService.createException(userId, {
            type: dto.type,
            offeringId: dto.offeringId,
            title: dto.title,
            startTime: dto.startTime,
            endTime: dto.endTime,
            timezone: dto.timezone,
            slotDurationMinutes: dto.slotDurationMinutes,
        });

        return SlotExceptionResponseDto.fromEntity('Availability exception created successfully', exception);
    }

    @Public()
    @Get('public/instructors/:profileId/availability')
    @ApiOperation({ summary: 'Get public slot availability for an instructor' })
    @ApiOkResponse({ type: PublicSlotListResponseDto })
    async getPublicAvailability(@Param('profileId') profileId: string, @Query() query: SlotAvailabilityQueryDto) {
        const slots = await this._slotService.getPublicAvailability(profileId, {
            offeringId: query.offeringId,
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
        });

        return PublicSlotListResponseDto.fromEntities('Public availability fetched successfully', slots);
    }
}