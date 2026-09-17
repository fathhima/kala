import { Module } from '@nestjs/common';
import { PrismaSlotRepository } from './repositories/prisma-slot.repository';
import { SLOT_REPOSITORY } from './repositories/interfaces/slot.interface';
import { SlotController } from './slot.controller';
import { SLOT_SERVICE } from './services/interfaces/slot.service.interface';
import { SlotService } from './services/slot.service';
import { InstructorModule } from '../instructor/instructor.module';

@Module({
  imports:[InstructorModule],
  controllers: [SlotController],
  providers: [
    {
      provide: SLOT_SERVICE,
      useClass: SlotService,
    },
    PrismaSlotRepository,
    {
      provide: SLOT_REPOSITORY,
      useExisting: PrismaSlotRepository,
    },
  ],
  exports: [SLOT_SERVICE, SLOT_REPOSITORY],
})
export class SlotModule {}