import { ConflictException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { CategoryEntity } from './entities/category.entity';
import { SubcategoryEntity } from './entities/subcategory.entity';
import { CATEGORY_REPOSITORY, type CategoryRepository, } from './repositories/interfaces/category.repository';
import { CreateCategoryDto } from './dto/request/create-category.dto';
import { UpdateCategoryDto } from './dto/request/update-category.dto';
import { CreateSubcategoryDto } from './dto/request/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/request/update-subcategory.dto';

@Injectable()
export class CategoryService {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: CategoryRepository,
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
            imageUrl: dto.imageUrl,
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
            imageUrl: dto.imageUrl,
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
            imageUrl: dto.imageUrl,
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
            imageUrl: dto.imageUrl,
            isActive: dto.isActive,
            sortOrder: dto.sortOrder,
        });
    }

    private async getCategoryOrThrow(categoryId: string,): Promise<CategoryEntity> {
        const category = await this.categoryRepository.findById(categoryId);

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    private slugify(value: string): string {
        const slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        if (!slug) {
            throw new ConflictException('Name must contain at least one letter or number',);
        }

        return slug;
    }
}