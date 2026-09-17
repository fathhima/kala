import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IPaginatedResult } from '@/shared/types/paginated-result';
import { CategoryEntity } from '@/modules/category/entities/category.entity';
import { SubcategoryEntity } from '@/modules/category/entities/subcategory.entity';
import { IAdminCategoryService } from './interfaces/admin-category.service.interface';
import { STORAGE_SERVICE, type IStorageService } from '@/shared/storage/repositories/interfaces/storage.interface';
import { CategoryListParams } from '@/modules/category/types/category-list-params.type';
import { CreateCategoryInput } from '@/modules/category/types/create-category-input.type';
import { UpdateCategoryInput } from '@/modules/category/types/update-category-input.type';
import { CreateSubcategoryInput } from '@/modules/category/types/create-subcategory-input.type';
import { UpdateSubcategoryInput } from '@/modules/category/types/update-subcategory-input.type';
import { ConfirmCategoryImageUploadInput, RequestCategoryImageUploadInput } from '@/modules/category/types/request-category-image-upload.input';
import { PresignedUpload } from '@/shared/storage/types/presigned-upload.type';
import { CATEGORY_IMAGE_MIME_TYPES } from '@/modules/category/constants/image-mime-types';
import { ADMIN_CATEGORY_REPOSITORY, type IAdminCategoryRepository } from '@/modules/category/repositories/interfaces/admin-category.interface';

@Injectable()
export class AdminCategoryService implements IAdminCategoryService {
    constructor(
        @Inject(ADMIN_CATEGORY_REPOSITORY)
        private readonly _categoryRepository: IAdminCategoryRepository,
        @Inject(STORAGE_SERVICE)
        private readonly _storageService: IStorageService
    ) { }

    async findManyForAdmin(params: CategoryListParams): Promise<IPaginatedResult<CategoryEntity>> {
        return this._categoryRepository.findManyForAdmin({
            page: params.page ?? 1,
            limit: params.limit ?? 10,
            search: params.search,
            isActive: params.isActive,
        })
    }

    async findSubcategories(categoryId: string,): Promise<SubcategoryEntity[]> {
        await this._getCategoryOrThrow(categoryId);

        return this._categoryRepository.findSubcategories(categoryId);
    }

    async createCategory(input: CreateCategoryInput): Promise<CategoryEntity> {
        const slug = this._slugify(input.slug ?? input.name);

        const existingCategory = await this._categoryRepository.findBySlug(slug);

        if (existingCategory) {
            throw new ConflictException('A category with this slug already exists',);
        }

        return this._categoryRepository.createCategory({
            name: input.name,
            slug,
            description: input.description,
            sortOrder: input.sortOrder ?? 0,
        });
    }

    async updateCategory(categoryId: string, input: UpdateCategoryInput): Promise<CategoryEntity> {
        await this._getCategoryOrThrow(categoryId);

        const slug = input.slug ? this._slugify(input.slug) : undefined;

        if (slug) {
            const existingCategory = await this._categoryRepository.findBySlug(slug);

            if (existingCategory && existingCategory.id !== categoryId) {
                throw new ConflictException('A category with this slug already exists',);
            }
        }

        return this._categoryRepository.updateCategory(categoryId, {
            name: input.name,
            slug,
            description: input.description,
            isActive: input.isActive,
            sortOrder: input.sortOrder,
        });
    }

    async createSubcategory(categoryId: string, input: CreateSubcategoryInput): Promise<SubcategoryEntity> {
        await this._getCategoryOrThrow(categoryId);

        const slug = this._slugify(input.slug ?? input.name);

        const existingSubcategory = await this._categoryRepository.findSubcategoryBySlug(categoryId, slug,);

        if (existingSubcategory) {
            throw new ConflictException('A subcategory with this slug already exists in this category',);
        }

        return this._categoryRepository.createSubcategory(categoryId, {
            name: input.name,
            slug,
            description: input.description,
            sortOrder: input.sortOrder ?? 0,
        });
    }

    async updateSubcategory(categoryId: string, subcategoryId: string, input: UpdateSubcategoryInput): Promise<SubcategoryEntity> {
        const subcategory = await this._categoryRepository.findSubcategoryById(categoryId, subcategoryId,);

        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        const slug = input.slug ? this._slugify(input.slug) : undefined;

        if (slug) {
            const existingSubcategory = await this._categoryRepository.findSubcategoryBySlug(categoryId, slug,);

            if (existingSubcategory && existingSubcategory.id !== subcategoryId) {
                throw new ConflictException('A subcategory with this slug already exists in this category',);
            }
        }

        return this._categoryRepository.updateSubcategory(subcategoryId, {
            name: input.name,
            slug,
            description: input.description,
            isActive: input.isActive,
            sortOrder: input.sortOrder,
        });
    }

    async createCategoryImageUploadUrl(categoryId: string, input: RequestCategoryImageUploadInput): Promise<PresignedUpload> {
        await this._getCategoryOrThrow(categoryId);

        const extension = this._imageExtension(input.mimeType);
        const storageKey = `categories/${categoryId}/images/${randomUUID()}.${extension}`;

        return this._storageService.createUploadUrl({
            key: storageKey,
            contentType: input.mimeType,
            expiresInSeconds: 300,
        });
    }

    async confirmCategoryImageUpload(categoryId: string, input: ConfirmCategoryImageUploadInput): Promise<CategoryEntity> {
        const category = await this._getCategoryOrThrow(categoryId);
        const expectedPrefix = `categories/${categoryId}/images/`;

        if (!input.storageKey.startsWith(expectedPrefix)) {
            throw new BadRequestException('Invalid category image key');
        }

        const object = await this._storageService.getObjectMetadata(
            input.storageKey,
        );

        if (!object) {
            throw new BadRequestException('Uploaded category image was not found',);
        }

        if (!object.contentType || !CATEGORY_IMAGE_MIME_TYPES.includes(object.contentType as (typeof CATEGORY_IMAGE_MIME_TYPES)[number],)) {
            throw new BadRequestException('Unsupported category image type');
        }

        if (object.sizeBytes < 1 || object.sizeBytes > 5 * 1024 * 1024) {
            throw new BadRequestException('Category image must be 5 MB or smaller',);
        }

        const updatedCategory = await this._categoryRepository.updateCategory(categoryId, {
            imageStorageKey: input.storageKey,
            imageUrl: null,
        });

        if (category.imageStorageKey && category.imageStorageKey !== input.storageKey) {
            await this._deleteOldImage(category.imageStorageKey);
        }

        return updatedCategory;
    }

    async getCategoryImageViewUrl(categoryId: string) {
        const category = await this._getCategoryOrThrow(categoryId);

        if (!category.imageStorageKey) {
            throw new NotFoundException('Category has no image');
        }

        const object = await this._storageService.getObjectMetadata(
            category.imageStorageKey,
        );

        if (!object) {
            throw new NotFoundException('Category image was not found');
        }

        return this._storageService.createDownloadUrl({
            key: category.imageStorageKey,
            expiresInSeconds: 900,
        });
    }

    async removeCategoryImage(categoryId: string,): Promise<CategoryEntity> {
        const category = await this._getCategoryOrThrow(categoryId);

        const updatedCategory = await this._categoryRepository.updateCategory(categoryId, {
            imageStorageKey: null,
            imageUrl: null,
        });

        if (category.imageStorageKey) {
            await this._deleteOldImage(category.imageStorageKey);
        }

        return updatedCategory;
    }

    async createSubcategoryImageUploadUrl(categoryId: string, subcategoryId: string, input: RequestCategoryImageUploadInput): Promise<PresignedUpload> {
        const subcategory = await this._categoryRepository.findSubcategoryById(categoryId, subcategoryId,);

        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        const extension = this._imageExtension(input.mimeType);
        const storageKey = `subcategories/${subcategoryId}/images/${randomUUID()}.${extension}`;

        return this._storageService.createUploadUrl({
            key: storageKey,
            contentType: input.mimeType,
            expiresInSeconds: 300,
        });
    }

    async confirmSubcategoryImageUpload(categoryId: string, subcategoryId: string, input: ConfirmCategoryImageUploadInput): Promise<SubcategoryEntity> {
        const subcategory = await this._categoryRepository.findSubcategoryById(categoryId, subcategoryId,);

        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        const expectedPrefix = `subcategories/${subcategoryId}/images/`;

        if (!input.storageKey.startsWith(expectedPrefix)) {
            throw new BadRequestException('Invalid subcategory image key');
        }

        const object = await this._storageService.getObjectMetadata(
            input.storageKey,
        );

        if (!object) {
            throw new BadRequestException('Uploaded subcategory image was not found',);
        }

        if (!object.contentType || !CATEGORY_IMAGE_MIME_TYPES.includes(object.contentType as (typeof CATEGORY_IMAGE_MIME_TYPES)[number],)) {
            throw new BadRequestException('Unsupported subcategory image type',);
        }

        if (object.sizeBytes < 1 || object.sizeBytes > 5 * 1024 * 1024) {
            throw new BadRequestException('Subcategory image must be 5 MB or smaller',);
        }

        const updatedSubcategory = await this._categoryRepository.updateSubcategory(subcategoryId, {
            imageStorageKey: input.storageKey,
            imageUrl: null,
        },);

        if (subcategory.imageStorageKey && subcategory.imageStorageKey !== input.storageKey) {
            await this._deleteOldImage(subcategory.imageStorageKey);
        }

        return updatedSubcategory;
    }

    async getSubcategoryImageViewUrl(categoryId: string, subcategoryId: string,) {
        const subcategory = await this._categoryRepository.findSubcategoryById(categoryId, subcategoryId,);

        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        if (!subcategory.imageStorageKey) {
            throw new NotFoundException('Subcategory has no image');
        }

        const object = await this._storageService.getObjectMetadata(
            subcategory.imageStorageKey,
        );

        if (!object) {
            throw new NotFoundException('Subcategory image was not found',);
        }

        return this._storageService.createDownloadUrl({
            key: subcategory.imageStorageKey,
            expiresInSeconds: 900,
        });
    }

    async removeSubcategoryImage(categoryId: string, subcategoryId: string,): Promise<SubcategoryEntity> {
        const subcategory = await this._categoryRepository.findSubcategoryById(categoryId, subcategoryId,);

        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        const updatedSubcategory = await this._categoryRepository.updateSubcategory(
            subcategoryId,
            {
                imageStorageKey: null,
                imageUrl: null,
            },
        );

        if (subcategory.imageStorageKey) {
            await this._deleteOldImage(subcategory.imageStorageKey);
        }

        return updatedSubcategory;
    }

    private async _deleteOldImage(storageKey: string): Promise<void> {
        try {
            await this._storageService.deleteObject(storageKey);
        } catch (error) {
            console.error(`Failed to delete S3 object: ${storageKey}`, error instanceof Error ? error.stack : undefined,);
        }
    }

    private async _getCategoryOrThrow(categoryId: string,): Promise<CategoryEntity> {
        const category = await this._categoryRepository.findById(categoryId);

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    private _imageExtension(mimeType: string): string {
        const extensions: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
        };

        const extension = extensions[mimeType];

        if (!extension) {
            throw new BadRequestException('Unsupported category image type');
        }

        return extension;
    }

    private _slugify(value: string): string {
        const slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        if (!slug) {
            throw new ConflictException('Name must contain at least one letter or number',);
        }

        return slug;
    }
}