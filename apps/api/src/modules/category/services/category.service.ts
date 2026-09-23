import { Inject, Injectable } from '@nestjs/common';
import { CategoryEntity } from '../entities/category.entity';
import { ICategoryService } from './interfaces/category.service.interface';
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '../repositories/interfaces/category.interface';

@Injectable()
export class CategoryService implements ICategoryService {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly _categoryRepository: ICategoryRepository,
    ) { }

    async findSelectable(): Promise<CategoryEntity[]> {
        return this._categoryRepository.findSelectable();
    }

    async isSelectableSubcategory(subcategoryId: string): Promise<boolean> {
        const subcategory = await this._categoryRepository.findSubcategoryByGlobalId(subcategoryId);

        if (!subcategory || !subcategory.isActive) return false;

        const parentCategory = await this._categoryRepository.findById(subcategory.categoryId);
        return parentCategory?.isActive === true;
    }

}