import { CategoryListParams } from '@/modules/category/types/category-list-params.type';
import { CreateCategoryInput } from '@/modules/category/types/create-category-input.type';
import { UpdateCategoryInput } from '@/modules/category/types/update-category-input.type';
import { CreateSubcategoryInput } from '@/modules/category/types/create-subcategory-input.type';
import { UpdateSubcategoryInput } from '@/modules/category/types/update-subcategory-input.type';
import { ConfirmCategoryImageUploadInput, RequestCategoryImageUploadInput, } from '@/modules/category/types/request-category-image-upload.input';
import { CategoryResponseDto, PaginatedCategoryResponseDto } from '@/modules/category/dto/response/category-response.dto';
import { SubcategoryResponseDto, SubcategoryListResponseDto } from '@/modules/category/dto/response/subcategory-response.dto';
import { CategoryImageUploadResponseDto } from '@/modules/category/dto/response/category-image-upload-response.dto';
import { CategoryImageViewResponseDto } from '@/modules/category/dto/response/category-image-view-response.dto';
import { SubcategoryImageUploadResponseDto } from '@/modules/category/dto/response/subcategory-image-upload-response.dto';
import { SubcategoryImageViewResponseDto } from '@/modules/category/dto/response/subcategory-image-view-response.dto';

export const ADMIN_CATEGORY_SERVICE = Symbol('ADMIN_CATEGORY_SERVICE');

export interface IAdminCategoryService {
    findManyForAdmin(params: CategoryListParams): Promise<PaginatedCategoryResponseDto>;

    findSubcategories(categoryId: string): Promise<SubcategoryListResponseDto>;

    createCategory(input: CreateCategoryInput): Promise<CategoryResponseDto>;

    updateCategory(categoryId: string, input: UpdateCategoryInput): Promise<CategoryResponseDto>;

    createSubcategory(categoryId: string, input: CreateSubcategoryInput): Promise<SubcategoryResponseDto>;

    updateSubcategory(categoryId: string, subcategoryId: string, input: UpdateSubcategoryInput): Promise<SubcategoryResponseDto>;

    createCategoryImageUploadUrl(categoryId: string, input: RequestCategoryImageUploadInput): Promise<CategoryImageUploadResponseDto>;

    confirmCategoryImageUpload(categoryId: string, input: ConfirmCategoryImageUploadInput): Promise<CategoryResponseDto>;

    getCategoryImageViewUrl(categoryId: string): Promise<CategoryImageViewResponseDto>;

    removeCategoryImage(categoryId: string): Promise<CategoryResponseDto>;

    createSubcategoryImageUploadUrl(categoryId: string, subcategoryId: string, input: RequestCategoryImageUploadInput): Promise<SubcategoryImageUploadResponseDto>;

    confirmSubcategoryImageUpload(categoryId: string, subcategoryId: string, input: ConfirmCategoryImageUploadInput): Promise<SubcategoryResponseDto>;

    getSubcategoryImageViewUrl(categoryId: string, subcategoryId: string): Promise<SubcategoryImageViewResponseDto>;

    removeSubcategoryImage(categoryId: string, subcategoryId: string): Promise<SubcategoryResponseDto>;
}