import { IPaginatedResult } from "@/shared/types/paginated-result";
import { CategoryEntity } from "../../entities/category.entity";
import { CategoryListParams } from "../../types/category-list-params.type";
import { CreateCategoryInput } from "../../types/create-category-input.type";
import { UpdateCategoryInput } from "../../types/update-category-input.type";
import { SubcategoryEntity } from "../../entities/subcategory.entity";
import { CreateSubcategoryInput } from "../../types/create-subcategory-input.type";
import { UpdateSubcategoryInput } from "../../types/update-subcategory-input.type";

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface ICategoryRepository {
    findSelectable(): Promise<CategoryEntity[]>;

    findManyForAdmin(params: CategoryListParams): Promise<IPaginatedResult<CategoryEntity>>;

    findById(categoryId: string): Promise<CategoryEntity | null>;

    findBySlug(slug: string): Promise<CategoryEntity | null>;

    createCategory(input: CreateCategoryInput): Promise<CategoryEntity>;

    updateCategory(categoryId: string, input: UpdateCategoryInput): Promise<CategoryEntity>;

    findSubcategories(categoryId: string): Promise<SubcategoryEntity[]>;

    findSubcategoryByGlobalId(subcategoryId: string,): Promise<SubcategoryEntity | null>

    findSubcategoryById(categoryId: string, subcategoryId: string): Promise<SubcategoryEntity | null>;

    findSubcategoryBySlug(categoryId: string, slug: string): Promise<SubcategoryEntity | null>;

    createSubcategory(categoryId: string, input: CreateSubcategoryInput): Promise<SubcategoryEntity>;

    updateSubcategory(subcategoryId: string, input: UpdateSubcategoryInput): Promise<SubcategoryEntity>;


}