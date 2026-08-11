import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { PrismaCategoryRepository } from './repositories/prisma-category.repository';
import { CATEGORY_REPOSITORY } from './repositories/interfaces/category.repository';
import { StorageModule } from '@/shared/storage/storage.module';

@Module({
    imports:[StorageModule],
    controllers: [CategoryController],
    providers: [
        CategoryService,
        PrismaCategoryRepository,
        {
            provide: CATEGORY_REPOSITORY,
            useExisting: PrismaCategoryRepository,
        },
    ],
    exports: [CATEGORY_REPOSITORY],
})
export class CategoryModule { }