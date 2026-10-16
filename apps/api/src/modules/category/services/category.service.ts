import { Inject, Injectable } from '@nestjs/common';
import { ICategoryService } from './interfaces/category.service.interface';
import { CATEGORY_REPOSITORY, type ICategoryRepository } from '../repositories/interfaces/category.interface';
import { CategoryListResponseDto } from '../dto/response/category-response.dto';

@Injectable()
export class CategoryService implements ICategoryService {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly _categoryRepository: ICategoryRepository,
    ) { }

    async findSelectable(): Promise<CategoryListResponseDto> {
        const categories = await this._categoryRepository.findSelectable();
        return CategoryListResponseDto.fromEntities('Selectable categories fetched successfully', categories);
    }

    async isSelectableSubcategory(subcategoryId: string): Promise<boolean> {
        const subcategory = await this._categoryRepository.findSubcategoryByGlobalId(subcategoryId);
        if (!subcategory || !subcategory.isActive) return false;
        const parentCategory = await this._categoryRepository.findById(subcategory.categoryId);
        return parentCategory?.isActive === true;
    }
}