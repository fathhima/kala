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
    async listInstructorAvailability(@UserId() userId: string, @Query() query: SlotAvailabilityQueryDto): Promise<InstructorSlotAvailabilityResponseDto> {
        return this._slotService.getInstructorAvailability(userId, query);
    }

    @Post('instructor/availability/rules')
    @Roles(UserRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Create a new availability rule' })
    @ApiCreatedResponse({ type: SlotRuleResponseDto })
    async createRule(@UserId() userId: string, @Body() dto: CreateSlotRuleDto): Promise<SlotRuleResponseDto> {
        return this._slotService.createRule(userId, dto);
    }

    @Patch('instructor/availability/rules/:ruleId')
    @Roles(UserRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Update an existing availability rule' })
    @ApiOkResponse({ type: SlotRuleResponseDto })
    async updateRule(@UserId() userId: string, @Param('ruleId') ruleId: string, @Body() dto: UpdateSlotRuleDto): Promise<SlotRuleResponseDto> {
        return this._slotService.updateRule(userId, ruleId, dto);
    }

    @Delete('instructor/availability/rules/:ruleId')
    @Roles(UserRole.INSTRUCTOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete an availability rule' })
    @ApiOkResponse({ type: MessageResponseDto })
    async deleteRule(@UserId() userId: string, @Param('ruleId') ruleId: string): Promise<MessageResponseDto> {
        return this._slotService.deleteRule(userId, ruleId);
    }

    @Post('instructor/availability/exceptions')
    @Roles(UserRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Create an availability exception' })
    @ApiCreatedResponse({ type: SlotExceptionResponseDto })
    async createException(@UserId() userId: string, @Body() dto: CreateSlotExceptionDto): Promise<SlotExceptionResponseDto> {
        return this._slotService.createException(userId, dto);
    }

    @Delete('instructor/availability/exceptions/:exceptionId')
    @Roles(UserRole.INSTRUCTOR)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete an availability exception' })
    @ApiOkResponse({ type: MessageResponseDto })
    async deleteException(@UserId() userId: string, @Param('exceptionId') exceptionId: string): Promise<MessageResponseDto> {
        return this._slotService.deleteException(userId, exceptionId);
    }

    @Public()
    @Get('public/instructors/:profileId/availability')
    @ApiOperation({ summary: 'Get public slot availability for an instructor' })
    @ApiOkResponse({ type: PublicSlotListResponseDto })
    async getPublicAvailability(@Param('profileId') profileId: string, @Query() query: SlotAvailabilityQueryDto): Promise<PublicSlotListResponseDto> {
        return this._slotService.getPublicAvailability(profileId, query);
    }
}