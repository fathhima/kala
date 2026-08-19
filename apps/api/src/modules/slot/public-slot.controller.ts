import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@/shared/decorators/public.decorator';
import { SchedulingService } from './slot.service';
import { PublicAvailabilityQueryDto } from './request/slot.request.dto';

@Public()
@Controller('public/instructors')
export class PublicSchedulingController {
    constructor(private readonly schedulingService: SchedulingService) { }

    @Get(':profileId/availability')
    getAvailability(@Param('profileId') profileId: string, @Query() query: PublicAvailabilityQueryDto,) {
        return this.schedulingService.getPublicAvailability(profileId, query);
    }
}