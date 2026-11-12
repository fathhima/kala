import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { StorageModule } from '@/shared/storage/storage.module';
import { CategoryModule } from '../category/category.module';
import { UserModule } from '../user/user.module';
import { InstructorController } from './instructor.controller';
import { ADMIN_INSTRUCTOR_REPOSITORY } from './repositories/interfaces/admin-instructor.interface';
import { INSTRUCTOR_REPOSITORY } from './repositories/interfaces/instructor.interface';
import { INSTRUCTOR_QUERY } from './repositories/interfaces/instructor-query.interface';
import { PrismaInstructorRepository } from './repositories/prisma-instructor.repository';
import { AdminInstructorService } from './services/admin-instructor.service';
import { InstructorService } from './services/instructor.service';
import { InstructorAnalyticsService } from './services/instructor-analytics.service';
import { ADMIN_INSTRUCTOR_SERVICE } from './services/interfaces/admin-instructor.service.interface';
import { INSTRUCTOR_SERVICE } from './services/interfaces/instructor.service.interface';

@Module({
  imports: [StorageModule, UserModule, CategoryModule, PrismaModule],
  controllers: [InstructorController],
  providers: [
    {
      provide: INSTRUCTOR_SERVICE,
      useClass: InstructorService,
    },
    {
      provide: ADMIN_INSTRUCTOR_SERVICE,
      useClass: AdminInstructorService,
    },
    PrismaInstructorRepository,
    {
      provide: INSTRUCTOR_REPOSITORY,
      useExisting: PrismaInstructorRepository,
    },
    {
      provide: ADMIN_INSTRUCTOR_REPOSITORY,
      useExisting: PrismaInstructorRepository,
    },
    {
      provide: INSTRUCTOR_QUERY,
      useExisting: PrismaInstructorRepository,
    },
    InstructorAnalyticsService,
  ],
  exports: [INSTRUCTOR_SERVICE, ADMIN_INSTRUCTOR_SERVICE],
})
export class InstructorModule {}
