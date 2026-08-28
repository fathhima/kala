import { Module } from '@nestjs/common';
import { StorageModule } from '@/shared/storage/storage.module';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './services/instructor.service';
import { PrismaInstructorRepository } from './repositories/prisma-instructor.repository';
import { INSTRUCTOR_REPOSITORY } from './repositories/interfaces/instructor.interface';
import { INSTRUCTOR_SERVICE } from './services/interfaces/instructor.service.interface';
import { ADMIN_INSTRUCTOR_REPOSITORY } from './repositories/interfaces/admin-instructor.interface';

@Module({
    imports: [StorageModule],
    controllers: [InstructorController],
    providers: [
        {
            provide: INSTRUCTOR_SERVICE,
            useClass: InstructorService,
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
    ],
    exports: [
        INSTRUCTOR_REPOSITORY,
        ADMIN_INSTRUCTOR_REPOSITORY,
    ],
})
export class InstructorModule { }