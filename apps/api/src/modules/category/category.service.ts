import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException, } from '@nestjs/common';
import { CategoryEntity } from './entities/category.entity';
import { SubcategoryEntity } from './entities/subcategory.entity';
import { CATEGORY_REPOSITORY, type CategoryRepository, } from './repositories/interfaces/category.repository';
import { CreateCategoryDto } from './dto/request/create-category.dto';
import { UpdateCategoryDto } from './dto/request/update-category.dto';
import { CreateSubcategoryDto } from './dto/request/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/request/update-subcategory.dto';
import { StorageService } from '@/shared/storage/storage.service';
import { CATEGORY_IMAGE_MIME_TYPES, RequestCategoryImageUploadDto } from './dto/request/create-category-image-upload.dto';
import { randomUUID } from 'crypto';
import { ConfirmCategoryImageUploadDto } from './dto/request/confirm-category-image-upload.dto';

@Injectable()
export class CategoryService {
    private readonly logger = new Logger(CategoryService.name);

    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: CategoryRepository,
        private readonly storageService: StorageService
    ) { }

    async findAll(): Promise<CategoryEntity[]> {
        return this.categoryRepository.findAll();
    }

    async findSubcategories(categoryId: string,): Promise<SubcategoryEntity[]> {
        await this.getCategoryOrThrow(categoryId);

        return this.categoryRepository.findSubcategories(categoryId);
    }

    async createCategory(dto: CreateCategoryDto,): Promise<CategoryEntity> {
        const slug = this.slugify(dto.slug ?? dto.name);

        const existingCategory = await this.categoryRepository.findBySlug(slug);

        if (existingCategory) {
            throw new ConflictException('A category with this slug already exists',);
        }

        return this.categoryRepository.createCategory({
            name: dto.name,
            slug,
            description: dto.description,
            sortOrder: dto.sortOrder ?? 0,
        });
    }

    async updateCategory(categoryId: string, dto: UpdateCategoryDto,): Promise<CategoryEntity> {
        await this.getCategoryOrThrow(categoryId);

        const slug = dto.slug ? this.slugify(dto.slug) : undefined;

        if (slug) {
            const existingCategory = await this.categoryRepository.findBySlug(slug);

            if (existingCategory && existingCategory.id !== categoryId) {
                throw new ConflictException('A category with this slug already exists',);
            }
        }

        return this.categoryRepository.updateCategory(categoryId, {
            name: dto.name,
            slug,
            description: dto.description,
            isActive: dto.isActive,
            sortOrder: dto.sortOrder,
        });
    }

    async createSubcategory(categoryId: string, dto: CreateSubcategoryDto,): Promise<SubcategoryEntity> {
        await this.getCategoryOrThrow(categoryId);

        const slug = this.slugify(dto.slug ?? dto.name);

        const existingSubcategory = await this.categoryRepository.findSubcategoryBySlug(
            categoryId,
            slug,
        );

        if (existingSubcategory) {
            throw new ConflictException('A subcategory with this slug already exists in this category',);
        }

        return this.categoryRepository.createSubcategory({
            categoryId,
            name: dto.name,
            slug,
            description: dto.description,
            sortOrder: dto.sortOrder ?? 0,
        });
    }

    async updateSubcategory(categoryId: string, subcategoryId: string, dto: UpdateSubcategoryDto,): Promise<SubcategoryEntity> {
        const subcategory = await this.categoryRepository.findSubcategoryById(
            categoryId,
            subcategoryId,
        );

        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        const slug = dto.slug ? this.slugify(dto.slug) : undefined;

        if (slug) {
            const existingSubcategory = await this.categoryRepository.findSubcategoryBySlug(
                categoryId,
                slug,
            );

            if (existingSubcategory && existingSubcategory.id !== subcategoryId) {
                throw new ConflictException('A subcategory with this slug already exists in this category',);
            }
        }

        return this.categoryRepository.updateSubcategory(subcategoryId, {
            name: dto.name,
            slug,
            description: dto.description,
            isActive: dto.isActive,
            sortOrder: dto.sortOrder,
        });
    }

    async createCategoryImageUploadUrl(categoryId: string, dto: RequestCategoryImageUploadDto,) {
        await this.getCategoryOrThrow(categoryId);

        const extension = this.imageExtension(dto.mimeType);
        const storageKey = `categories/${categoryId}/images/${randomUUID()}.${extension}`;

        return this.storageService.createUploadUrl({
            key: storageKey,
            contentType: dto.mimeType,
            expiresInSeconds: 300,
        });
    }

    async confirmCategoryImageUpload(categoryId: string, dto: ConfirmCategoryImageUploadDto,): Promise<CategoryEntity> {
        const category = await this.getCategoryOrThrow(categoryId);
        const expectedPrefix = `categories/${categoryId}/images/`;

        if (!dto.storageKey.startsWith(expectedPrefix)) {
            throw new BadRequestException('Invalid category image key');
        }

        const object = await this.storageService.getObjectMetadata(
            dto.storageKey,
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

        const updatedCategory = await this.categoryRepository.updateCategory(categoryId, {
            imageStorageKey: dto.storageKey,
            imageUrl: null,
        });

        if (category.imageStorageKey && category.imageStorageKey !== dto.storageKey) {
            await this.deleteOldImage(category.imageStorageKey);
        }

        return updatedCategory;
    }

    async getCategoryImageViewUrl(categoryId: string) {
        const category = await this.getCategoryOrThrow(categoryId);

        if (!category.imageStorageKey) {
            throw new NotFoundException('Category has no image');
        }

        const object = await this.storageService.getObjectMetadata(
            category.imageStorageKey,
        );

        if (!object) {
            throw new NotFoundException('Category image was not found');
        }

        return this.storageService.createDownloadUrl({
            key: category.imageStorageKey,
            expiresInSeconds: 900,
        });
    }

    async removeCategoryImage(categoryId: string,): Promise<CategoryEntity> {
        const category = await this.getCategoryOrThrow(categoryId);

        const updatedCategory = await this.categoryRepository.updateCategory(categoryId, {
            imageStorageKey: null,
            imageUrl: null,
        });

        if (category.imageStorageKey) {
            await this.deleteOldImage(category.imageStorageKey);
        }

        return updatedCategory;
    }

    async createSubcategoryImageUploadUrl(categoryId: string, subcategoryId: string, dto: RequestCategoryImageUploadDto,) {
        const subcategory = await this.categoryRepository.findSubcategoryById(
            categoryId,
            subcategoryId,
        );

        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        const extension = this.imageExtension(dto.mimeType);
        const storageKey = `subcategories/${subcategoryId}/images/${randomUUID()}.${extension}`;

        return this.storageService.createUploadUrl({
            key: storageKey,
            contentType: dto.mimeType,
            expiresInSeconds: 300,
        });
    }

    async confirmSubcategoryImageUpload(categoryId: string, subcategoryId: string, dto: ConfirmCategoryImageUploadDto,): Promise<SubcategoryEntity> {
        const subcategory = await this.categoryRepository.findSubcategoryById(
            categoryId,
            subcategoryId,
        );

        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        const expectedPrefix = `subcategories/${subcategoryId}/images/`;

        if (!dto.storageKey.startsWith(expectedPrefix)) {
            throw new BadRequestException('Invalid subcategory image key');
        }

        const object = await this.storageService.getObjectMetadata(
            dto.storageKey,
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

        const updatedSubcategory = await this.categoryRepository.updateSubcategory(
            subcategoryId,
            {
                imageStorageKey: dto.storageKey,
                imageUrl: null,
            },
        );

        if (subcategory.imageStorageKey && subcategory.imageStorageKey !== dto.storageKey) {
            await this.deleteOldImage(subcategory.imageStorageKey);
        }

        return updatedSubcategory;
    }

    async getSubcategoryImageViewUrl(categoryId: string, subcategoryId: string,) {
        const subcategory = await this.categoryRepository.findSubcategoryById(
            categoryId,
            subcategoryId,
        );

        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        if (!subcategory.imageStorageKey) {
            throw new NotFoundException('Subcategory has no image');
        }

        const object = await this.storageService.getObjectMetadata(
            subcategory.imageStorageKey,
        );

        if (!object) {
            throw new NotFoundException('Subcategory image was not found',);
        }

        return this.storageService.createDownloadUrl({
            key: subcategory.imageStorageKey,
            expiresInSeconds: 900,
        });
    }

    async removeSubcategoryImage(categoryId: string, subcategoryId: string,): Promise<SubcategoryEntity> {
        const subcategory = await this.categoryRepository.findSubcategoryById(
            categoryId,
            subcategoryId,
        );

        if (!subcategory) {
            throw new NotFoundException('Subcategory not found');
        }

        const updatedSubcategory = await this.categoryRepository.updateSubcategory(
            subcategoryId,
            {
                imageStorageKey: null,
                imageUrl: null,
            },
        );

        if (subcategory.imageStorageKey) {
            await this.deleteOldImage(subcategory.imageStorageKey);
        }

        return updatedSubcategory;
    }

    private async deleteOldImage(storageKey: string): Promise<void> {
        try {
            await this.storageService.deleteObject(storageKey);
        } catch (error) {
            this.logger.error(`Failed to delete S3 object: ${storageKey}`, error instanceof Error ? error.stack : undefined,);
        }
    }

    private async getCategoryOrThrow(categoryId: string,): Promise<CategoryEntity> {
        const category = await this.categoryRepository.findById(categoryId);

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    private imageExtension(mimeType: string): string {
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

    private slugify(value: string): string {
        const slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        if (!slug) {
            throw new ConflictException('Name must contain at least one letter or number',);
        }

        return slug;
    }
}