import { Module } from '@nestjs/common';
import { PrismaCategoryRepository } from './repositories/prisma-category.repository';
import { CategoryController } from './category.controller';
import { CategoryService } from './services/category.service';
import { CATEGORY_SERVICE } from './services/interfaces/category.service.interface';
import { CATEGORY_REPOSITORY } from './repositories/interfaces/category.interface';
import { ADMIN_CATEGORY_SERVICE } from './services/interfaces/admin-category.service.interface';
import { AdminCategoryService } from './services/admin-category.service';
import { StorageModule } from '@/shared/storage/storage.module';
import { PrismaModule } from '@/shared/prisma/prisma.module';

@Module({
    imports: [StorageModule, PrismaModule],
    controllers: [CategoryController],
    providers: [
        {
            provide: CATEGORY_SERVICE,
            useClass: CategoryService,
        },
        {
            provide: ADMIN_CATEGORY_SERVICE,
            useClass: AdminCategoryService
        },
        PrismaCategoryRepository,
        {
            provide: CATEGORY_REPOSITORY,
            useExisting: PrismaCategoryRepository,
        },
    ],
    exports: [CATEGORY_SERVICE, ADMIN_CATEGORY_SERVICE],
})
export class CategoryModule { }