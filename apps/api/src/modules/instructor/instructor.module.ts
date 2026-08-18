import { Module } from '@nestjs/common';
import { StorageModule } from '@/shared/storage/storage.module';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { PrismaInstructorRepository } from './repositories/prisma-instructor.repository';
import { INSTRUCTOR_REPOSITORY } from './repositories/interfaces/instructor.repository';
import { ADMIN_INSTRUCTOR_REPOSITORY } from './repositories/interfaces/admin-instructor.repositoty';

@Module({
    imports: [StorageModule],
    controllers: [InstructorController],
    providers: [
        InstructorService,
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