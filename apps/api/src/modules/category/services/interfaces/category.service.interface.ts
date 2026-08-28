import { CategoryEntity } from '../../entities/category.entity';

export const CATEGORY_SERVICE = Symbol('CATEGORY_SERVICE');

export interface ICategoryService {
    findSelectable(): Promise<CategoryEntity[]>;
}