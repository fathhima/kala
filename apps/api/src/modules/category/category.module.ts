import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { PrismaCategoryRepository } from './repositories/prisma-category.repository';
import { CATEGORY_REPOSITORY } from './repositories/interfaces/category.repository';

@Module({
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