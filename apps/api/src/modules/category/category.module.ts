import { Module } from '@nestjs/common';
import { PrismaCategoryRepository } from './repositories/prisma-category.repository';
import { CATEGORY_REPOSITORY } from './repositories/interfaces/category.interface';
import { CategoryController } from './category.controller';
import { CategoryService } from './services/category.service';
import { CATEGORY_SERVICE } from './services/interfaces/category.service.interface';

@Module({
    imports: [],
    controllers: [CategoryController],
    providers: [
        {
            provide: CATEGORY_SERVICE,
            useClass: CategoryService,
        },
        PrismaCategoryRepository,
        {
            provide: CATEGORY_REPOSITORY,
            useExisting: PrismaCategoryRepository,
        },
    ],
    exports: [CATEGORY_REPOSITORY, CATEGORY_SERVICE],
})
export class CategoryModule { }