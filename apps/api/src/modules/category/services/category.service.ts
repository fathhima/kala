import { Inject, Injectable } from '@nestjs/common';
import { CategoryEntity } from '../entities/category.entity';
import {
    CATEGORY_REPOSITORY,
    type ICategoryRepository,
} from '../repositories/interfaces/category.interface';
import { ICategoryService } from './interfaces/category.service.interface';

@Injectable()
export class CategoryService implements ICategoryService {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly _categoryRepository: ICategoryRepository,
    ) { }

    async findSelectable(): Promise<CategoryEntity[]> {
        return this._categoryRepository.findSelectable();
    }
}