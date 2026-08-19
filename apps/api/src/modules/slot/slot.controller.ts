import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserId } from '@/shared/decorators/user-id.decorator';
import { UserRole } from '@/shared/enums/role.enum';
import { MessageResponseDto } from '@/shared/dto/response/message-response.dto';
import { SchedulingService } from './slot.service';
import { CreateSlotsDto, InstructorSlotQueryDto, UpdateSlotDto } from './request/slot.request.dto';


@Controller('instructor/slots')
@Roles(UserRole.INSTRUCTOR)
export class SchedulingController {
    constructor(private readonly schedulingService: SchedulingService) { }

    @Get()
    list(@UserId() userId: string, @Query() query: InstructorSlotQueryDto) {
        return this.schedulingService.listInstructorSlots(userId, query);
    }

    @Post('bulk')
    create(@UserId() userId: string, @Body() dto: CreateSlotsDto) {
        return this.schedulingService.createSlots(userId, dto);
    }

    @Patch(':slotId')
    update(
        @UserId() userId: string,
        @Param('slotId') slotId: string,
        @Body() dto: UpdateSlotDto,
    ) {
        return this.schedulingService.updateSlot(userId, slotId, dto);
    }

    @Delete(':slotId')
    @HttpCode(HttpStatus.OK)
    async cancel(@UserId() userId: string, @Param('slotId') slotId: string) {
        await this.schedulingService.cancelSlot(userId, slotId);
        return MessageResponseDto.success('Slot cancelled successfully');
    }
}