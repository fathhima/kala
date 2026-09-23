import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IPaginatedResult } from '@/shared/types/paginated-result';
import { IAdminCategoryService } from './interfaces/admin-category.service.interface';
import { STORAGE_SERVICE, type IStorageService, } from '@/shared/storage/repositories/interfaces/storage.interface';
import { PresignedUpload } from '@/shared/storage/types/presigned-upload.type';
import { CategoryEntity } from '../entities/category.entity';
import { SubcategoryEntity } from '../entities/subcategory.entity';
import { CreateCategoryInput } from '../types/create-category-input.type';
import { UpdateCategoryInput } from '../types/update-category-input.type';
import { CreateSubcategoryInput } from '../types/create-subcategory-input.type';
import { UpdateSubcategoryInput } from '../types/update-subcategory-input.type';
import { ConfirmCategoryImageUploadInput, RequestCategoryImageUploadInput, } from '../types/request-category-image-upload.input';
import { CATEGORY_IMAGE_KEY_PREFIX, CATEGORY_IMAGE_MAX_BYTES, CATEGORY_IMAGE_MIME_TYPES, SUBCATEGORY_IMAGE_KEY_PREFIX } from '../constants/image-mime-types';
import { CATEGORY_REPOSITORY, type ICategoryRepository, } from '../repositories/interfaces/category.interface';
import { CategoryListParams } from '../types/category-list-params.type';
import { type ILoggerService, LOGGER_SERVICE, } from '@/shared/logger/repositories/interfaces/logger.interface';

@Injectable()
export class AdminCategoryService implements IAdminCategoryService {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly _categoryRepository: ICategoryRepository,
        @Inject(STORAGE_SERVICE)
        private readonly _storageService: IStorageService,
        @Inject(LOGGER_SERVICE)
        private readonly _loggerService: ILoggerService,
    ) { }

    async findManyForAdmin(params: CategoryListParams,): Promise<IPaginatedResult<CategoryEntity>> {
        return this._categoryRepository.findManyForAdmin({
            page: params.page ?? 1,
            limit: params.limit ?? 10,
            search: params.search,
            isActive: params.isActive,
        });
    }

    async findSubcategories(categoryId: string): Promise<SubcategoryEntity[]> {
        await this._getCategoryOrThrow(categoryId);

        return this._categoryRepository.findSubcategories(categoryId);
    }

    async createCategory(input: CreateCategoryInput): Promise<CategoryEntity> {
        const slug = this._slugify(input.slug ?? input.name);

        const existingCategory = await this._categoryRepository.findBySlug(slug);

        if (existingCategory) {
            throw new ConflictException('A category with this slug already exists');
        }

        return this._categoryRepository.createCategory({
            name: input.name,
            slug,
            description: input.description,
            sortOrder: input.sortOrder ?? 0,
        });
    }

    async updateCategory(categoryId: string, input: UpdateCategoryInput,): Promise<CategoryEntity> {
        await this._getCategoryOrThrow(categoryId);

        const slug = input.slug ? this._slugify(input.slug) : undefined;

        if (slug) {
            const existingCategory = await this._categoryRepository.findBySlug(slug);

            if (existingCategory && existingCategory.id !== categoryId) {
                throw new ConflictException('A category with this slug already exists');
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

    async createSubcategory(categoryId: string, input: CreateSubcategoryInput,): Promise<SubcategoryEntity> {
        await this._getCategoryOrThrow(categoryId);

        const slug = this._slugify(input.slug ?? input.name);

        const existingSubcategory =
            await this._categoryRepository.findSubcategoryBySlug(categoryId, slug);

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

    async updateSubcategory(categoryId: string, subcategoryId: string, input: UpdateSubcategoryInput,): Promise<SubcategoryEntity> {
        const subcategory = await this._categoryRepository.findSubcategoryById(categoryId, subcategoryId,);

        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        const slug = input.slug ? this._slugify(input.slug) : undefined;

        if (slug) {
            const existingSubcategory =
                await this._categoryRepository.findSubcategoryBySlug(categoryId, slug);

            if (existingSubcategory && existingSubcategory.id !== subcategoryId) {
                throw new ConflictException(
                    'A subcategory with this slug already exists in this category',
                );
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

    async createCategoryImageUploadUrl(categoryId: string, input: RequestCategoryImageUploadInput,): Promise<PresignedUpload> {
        await this._getCategoryOrThrow(categoryId);

        const extension = this._imageExtension(input.mimeType);
        const storageKey = `${CATEGORY_IMAGE_KEY_PREFIX}/${categoryId}/images/${randomUUID()}.${extension}`;

        return this._storageService.createUploadUrl({
            key: storageKey,
            contentType: input.mimeType,
            expiresInSeconds: 300,
        });
    }

    async confirmCategoryImageUpload(categoryId: string, input: ConfirmCategoryImageUploadInput,): Promise<CategoryEntity> {
        const category = await this._getCategoryOrThrow(categoryId);
        const expectedPrefix = `${CATEGORY_IMAGE_KEY_PREFIX}/${categoryId}/images/`;

        if (!input.storageKey.startsWith(expectedPrefix)) {
            throw new BadRequestException('Invalid category image key');
        }

        const object = await this._storageService.getObjectMetadata(input.storageKey,);

        if (!object) {
            throw new BadRequestException('Uploaded category image was not found');
        }

        if (!object.contentType || !CATEGORY_IMAGE_MIME_TYPES.includes(object.contentType as (typeof CATEGORY_IMAGE_MIME_TYPES)[number],)) {
            throw new BadRequestException('Unsupported category image type');
        }

        if (object.sizeBytes < 1 || object.sizeBytes > CATEGORY_IMAGE_MAX_BYTES) {
            throw new BadRequestException('Category image must be 5 MB or smaller');
        }

        const updatedCategory = await this._categoryRepository.updateCategory(
            categoryId,
            {
                imageStorageKey: input.storageKey,
                imageUrl: null,
            },
        );

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

    async removeCategoryImage(categoryId: string): Promise<CategoryEntity> {
        const category = await this._getCategoryOrThrow(categoryId);

        const updatedCategory = await this._categoryRepository.updateCategory(
            categoryId,
            {
                imageStorageKey: null,
                imageUrl: null,
            },
        );

        if (category.imageStorageKey) {
            await this._deleteOldImage(category.imageStorageKey);
        }

        return updatedCategory;
    }

    async createSubcategoryImageUploadUrl(categoryId: string, subcategoryId: string, input: RequestCategoryImageUploadInput,): Promise<PresignedUpload> {
        const subcategory = await this._categoryRepository.findSubcategoryById(categoryId, subcategoryId,);

        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        const extension = this._imageExtension(input.mimeType);
        const storageKey = `${SUBCATEGORY_IMAGE_KEY_PREFIX}/${subcategoryId}/images/${randomUUID()}.${extension}`;

        return this._storageService.createUploadUrl({
            key: storageKey,
            contentType: input.mimeType,
            expiresInSeconds: 300,
        });
    }

    async confirmSubcategoryImageUpload(categoryId: string, subcategoryId: string, input: ConfirmCategoryImageUploadInput,): Promise<SubcategoryEntity> {
        const subcategory = await this._categoryRepository.findSubcategoryById(categoryId, subcategoryId,);

        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        const expectedPrefix = `${SUBCATEGORY_IMAGE_KEY_PREFIX}/${subcategoryId}/images/`;

        if (!input.storageKey.startsWith(expectedPrefix)) {
            throw new BadRequestException('Invalid subcategory image key');
        }

        const object = await this._storageService.getObjectMetadata(
            input.storageKey,
        );

        if (!object) {
            throw new BadRequestException('Uploaded subcategory image was not found');
        }

        if (!object.contentType || !CATEGORY_IMAGE_MIME_TYPES.includes(object.contentType as (typeof CATEGORY_IMAGE_MIME_TYPES)[number],)
        ) {
            throw new BadRequestException('Unsupported subcategory image type');
        }

        if (object.sizeBytes < 1 || object.sizeBytes > CATEGORY_IMAGE_MAX_BYTES) {
            throw new BadRequestException('Subcategory image must be 5 MB or smaller',);
        }

        const updatedSubcategory = await this._categoryRepository.updateSubcategory(
            subcategoryId,
            {
                imageStorageKey: input.storageKey,
                imageUrl: null,
            },
        );

        if (subcategory.imageStorageKey && subcategory.imageStorageKey !== input.storageKey) {
            await this._deleteOldImage(subcategory.imageStorageKey);
        }

        return updatedSubcategory;
    }

    async getSubcategoryImageViewUrl(categoryId: string, subcategoryId: string) {
        const subcategory = await this._categoryRepository.findSubcategoryById(categoryId, subcategoryId,);

        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        if (!subcategory.imageStorageKey) {
            throw new NotFoundException('Subcategory has no image');
        }

        const object = await this._storageService.getObjectMetadata(subcategory.imageStorageKey,);

        if (!object) {
            throw new NotFoundException('Subcategory image was not found');
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
            this._loggerService.error(
                `Failed to delete stored object: ${storageKey}`,
                error instanceof Error ? error.stack : undefined,
                AdminCategoryService.name,
            );
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
        const slug = value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        if (!slug) {
            throw new ConflictException(
                'Name must contain at least one letter or number',
            );
        }

        return slug;
    }
}
