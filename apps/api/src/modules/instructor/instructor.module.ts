import { Module } from '@nestjs/common';
import { StorageModule } from '@/shared/storage/storage.module';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './services/instructor.service';
import { PrismaInstructorRepository } from './repositories/prisma-instructor.repository';
import { INSTRUCTOR_REPOSITORY } from './repositories/interfaces/instructor.interface';
import { INSTRUCTOR_SERVICE } from './services/interfaces/instructor.service.interface';
import { ADMIN_INSTRUCTOR_REPOSITORY } from './repositories/interfaces/admin-instructor.interface';
import { INSTRUCTOR_QUERY } from './repositories/interfaces/instructor-query.interface';
import { ADMIN_INSTRUCTOR_SERVICE } from './services/interfaces/admin-instructor.service.interface';
import { AdminInstructorService } from './services/admin-instructor.service';
import { UserModule } from '../user/user.module';
import { CategoryModule } from '../category/category.module';
import { PrismaModule } from '@/shared/prisma/prisma.module';

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
            useClass: AdminInstructorService
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
        }
    ],
    exports: [
        INSTRUCTOR_SERVICE, ADMIN_INSTRUCTOR_SERVICE
    ],
})
export class InstructorModule { }