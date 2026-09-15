import { CategoryEntity } from '@/modules/category/entities/category.entity';
import { SubcategoryEntity } from '@/modules/category/entities/subcategory.entity';
import { CategoryListParams } from '@/modules/category/types/category-list-params.type';
import { CreateCategoryInput } from '@/modules/category/types/create-category-input.type';
import { UpdateCategoryInput } from '@/modules/category/types/update-category-input.type';
import { CreateSubcategoryInput } from '@/modules/category/types/create-subcategory-input.type';
import { UpdateSubcategoryInput } from '@/modules/category/types/update-subcategory-input.type';
import { ConfirmCategoryImageUploadInput, RequestCategoryImageUploadInput, } from '@/modules/category/types/request-category-image-upload.input';
import { PresignedDownload } from '@/shared/storage/types/presigned-download.type';
import { PresignedUpload } from '@/shared/storage/types/presigned-upload.type';
import { IPaginatedResult } from '@/shared/types';

export const ADMIN_CATEGORY_SERVICE = Symbol('ADMIN_CATEGORY_SERVICE');

export interface IAdminCategoryService {
    findManyForAdmin(params: CategoryListParams): Promise<IPaginatedResult<CategoryEntity>>;

    findSubcategories(categoryId: string): Promise<SubcategoryEntity[]>;

    createCategory(input: CreateCategoryInput): Promise<CategoryEntity>;

    updateCategory(categoryId: string, input: UpdateCategoryInput): Promise<CategoryEntity>;

    createSubcategory(categoryId: string, input: CreateSubcategoryInput): Promise<SubcategoryEntity>;

    updateSubcategory(categoryId: string, subcategoryId: string, input: UpdateSubcategoryInput): Promise<SubcategoryEntity>;

    createCategoryImageUploadUrl(categoryId: string, input: RequestCategoryImageUploadInput): Promise<PresignedUpload>;

    confirmCategoryImageUpload(categoryId: string, input: ConfirmCategoryImageUploadInput): Promise<CategoryEntity>;

    getCategoryImageViewUrl(categoryId: string): Promise<PresignedDownload>;

    removeCategoryImage(categoryId: string): Promise<CategoryEntity>;

    createSubcategoryImageUploadUrl(categoryId: string, subcategoryId: string, input: RequestCategoryImageUploadInput): Promise<PresignedUpload>;

    confirmSubcategoryImageUpload(categoryId: string, subcategoryId: string, input: ConfirmCategoryImageUploadInput): Promise<SubcategoryEntity>;

    getSubcategoryImageViewUrl(categoryId: string, subcategoryId: string): Promise<PresignedDownload>;

    removeSubcategoryImage(categoryId: string, subcategoryId: string): Promise<SubcategoryEntity>;
}