import { IPaginatedResult } from '@/shared/types/paginated-result';
import { CategoryEntity } from '../../entities/category.entity';
import { SubcategoryEntity } from '../../entities/subcategory.entity';
import { CategoryListParams } from '../../types/category-list-params.type';
import { CreateCategoryInput } from '../../types/create-category-input.type';
import { CreateSubcategoryInput } from '../../types/create-subcategory-input.type';
import { UpdateCategoryInput } from '../../types/update-category-input.type';
import { UpdateSubcategoryInput } from '../../types/update-subcategory-input.type';

export const ADMIN_CATEGORY_REPOSITORY = Symbol('ADMIN_CATEGORY_REPOSITORY');

export interface IAdminCategoryRepository {
    findManyForAdmin(params: CategoryListParams): Promise<IPaginatedResult<CategoryEntity>>;

    findById(categoryId: string): Promise<CategoryEntity | null>;

    findBySlug(slug: string): Promise<CategoryEntity | null>;

    createCategory(input: CreateCategoryInput): Promise<CategoryEntity>;

    updateCategory(categoryId: string, input: UpdateCategoryInput): Promise<CategoryEntity>;

    findSubcategories(categoryId: string): Promise<SubcategoryEntity[]>;

    findSubcategoryById(categoryId: string, subcategoryId: string): Promise<SubcategoryEntity | null>;

    findSubcategoryBySlug(categoryId: string, slug: string): Promise<SubcategoryEntity | null>;

    createSubcategory(categoryId: string, input: CreateSubcategoryInput): Promise<SubcategoryEntity>;

    updateSubcategory(subcategoryId: string, input: UpdateSubcategoryInput): Promise<SubcategoryEntity>;
}