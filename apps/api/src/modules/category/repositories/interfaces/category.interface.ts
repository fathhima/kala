import { CategoryEntity } from "../../entities/category.entity";

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface ICategoryRepository {
    findSelectable(): Promise<CategoryEntity[]>;

    findById(categoryId: string): Promise<CategoryEntity | null>;
}