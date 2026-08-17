import { Module } from '@nestjs/common';
import { StorageModule } from '@/shared/storage/storage.module';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { PrismaInstructorRepository } from './repositories/prisma-instructor.repository';
import { INSTRUCTOR_REPOSITORY } from './repositories/interfaces/instructor.repository';
import { INSTRUCTOR_REVIEW_REPOSITORY } from './repositories/interfaces/instructor-review.repositoty';

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
            provide: INSTRUCTOR_REVIEW_REPOSITORY,
            useExisting: PrismaInstructorRepository,
        },
    ],
    exports: [
        INSTRUCTOR_REPOSITORY,
        INSTRUCTOR_REVIEW_REPOSITORY,
    ],
})
export class InstructorModule { }