import { CategoryListResponseDto } from '../../dto/response/category-response.dto';

export const CATEGORY_SERVICE = Symbol('CATEGORY_SERVICE');

export interface ICategoryService {
    findSelectable(): Promise<CategoryListResponseDto>;
    isSelectableSubcategory(subcategoryId: string): Promise<boolean>;
}