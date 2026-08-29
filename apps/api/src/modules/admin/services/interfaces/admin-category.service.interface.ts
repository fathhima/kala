import { CategoryQueryDto } from "@/modules/category/dto/request/category-query.dto";
import { ConfirmCategoryImageUploadDto } from "@/modules/category/dto/request/confirm-category-image-upload.dto";
import { RequestCategoryImageUploadDto } from "@/modules/category/dto/request/create-category-image-upload.dto";
import { CreateCategoryDto } from "@/modules/category/dto/request/create-category.dto";
import { CreateSubcategoryDto } from "@/modules/category/dto/request/create-subcategory.dto";
import { UpdateCategoryDto } from "@/modules/category/dto/request/update-category.dto";
import { UpdateSubcategoryDto } from "@/modules/category/dto/request/update-subcategory.dto";
import { CategoryEntity } from "@/modules/category/entities/category.entity";
import { SubcategoryEntity } from "@/modules/category/entities/subcategory.entity";
import { PresignedDownload } from "@/shared/storage/types/presigned-download.type";
import { PresignedUpload } from "@/shared/storage/types/presigned-upload.type";
import { IPaginatedResult } from "@/shared/types";

export const ADMIN_CATEGORY_SERVICE = Symbol('ADMIN_CATEGORY_SERVICE');

export interface IAdminCategoryService {
    findManyForAdmin(query: CategoryQueryDto): Promise<IPaginatedResult<CategoryEntity>>;

    findSubcategories(categoryId: string): Promise<SubcategoryEntity[]>;

    createCategory(dto: CreateCategoryDto): Promise<CategoryEntity>;

    updateCategory(categoryId: string, dto: UpdateCategoryDto): Promise<CategoryEntity>;

    createSubcategory(categoryId: string, dto: CreateSubcategoryDto,): Promise<SubcategoryEntity>;

    updateSubcategory(categoryId: string, subcategoryId: string, dto: UpdateSubcategoryDto,): Promise<SubcategoryEntity>;

    createCategoryImageUploadUrl(categoryId: string, dto: RequestCategoryImageUploadDto): Promise<PresignedUpload>;

    confirmCategoryImageUpload(categoryId: string, dto: ConfirmCategoryImageUploadDto): Promise<CategoryEntity>;

    getCategoryImageViewUrl(categoryId: string): Promise<PresignedDownload>;

    removeCategoryImage(categoryId: string): Promise<CategoryEntity>;

    createSubcategoryImageUploadUrl(categoryId: string, subcategoryId: string, dto: RequestCategoryImageUploadDto): Promise<PresignedUpload>;

    confirmSubcategoryImageUpload(categoryId: string, subcategoryId: string, dto: ConfirmCategoryImageUploadDto): Promise<SubcategoryEntity>;

    getSubcategoryImageViewUrl(categoryId: string, subcategoryId: string): Promise<PresignedDownload>;

    removeSubcategoryImage(categoryId: string, subcategoryId: string): Promise<SubcategoryEntity>;
}