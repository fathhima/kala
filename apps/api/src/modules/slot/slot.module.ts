import { Module } from '@nestjs/common';
import { SchedulingController } from './slot.controller';
import { PublicSchedulingController } from './public-slot.controller';
import { SchedulingService } from './slot.service';

@Module({
  controllers: [SchedulingController, PublicSchedulingController],
  providers: [SchedulingService],
})
export class SchedulingModule {}