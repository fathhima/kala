import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CategoryEntity } from '../entities/category.entity';
import { SubcategoryEntity } from '../entities/subcategory.entity';
import { CategoryMapper } from '../mappers/category.mapper';
import { CreateCategoryInput } from '../types/create-category-input.type';
import { CreateSubcategoryInput } from '../types/create-subcategory-input.type';
import { UpdateCategoryInput } from '../types/update-category-input.type';
import { UpdateSubcategoryInput } from '../types/update-subcategory-input.type';
import { CategoryRepository } from './interfaces/category.repository';
import { CategoryListParams } from '../types/category-list-params.type';
import { PaginatedResult } from '@/shared/types/paginated-result';

const categoryWithSubcategories = {
    subcategories: {
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    },
} satisfies Prisma.CategoryInclude;

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findManyForAdmin(params: CategoryListParams): Promise<PaginatedResult<CategoryEntity>> {
        const skip = (params.page - 1) * params.limit
        const where: Prisma.CategoryWhereInput = {}

        if (params.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { slug: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
            ]
        }

        if (typeof params.isActive === 'boolean') {
            where.isActive = params.isActive
        }

        const [categories, total] = await this.prisma.$transaction([
            this.prisma.category.findMany({
                where,
                skip,
                take: params.limit,
                include: categoryWithSubcategories,
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            }),
            this.prisma.category.count({ where }),
        ])

        return {
            items: categories.map(CategoryMapper.toCategoryEntity),
            total,
            page: params.page,
            limit: params.limit,
        }
    }

    async findAll(): Promise<CategoryEntity[]> {
        const categories = await this.prisma.category.findMany({
            include: categoryWithSubcategories,
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });

        return categories.map(CategoryMapper.toCategoryEntity);
    }

    async findSelectable(): Promise<CategoryEntity[]> {
        const categories = await this.prisma.category.findMany({
            where: {
                isActive: true,
            },
            include: {
                subcategories: {
                    where: {
                        isActive: true,
                    },
                    orderBy: [
                        { sortOrder: 'asc' },
                        { name: 'asc' },
                    ],
                },
            },
            orderBy: [
                { sortOrder: 'asc' },
                { name: 'asc' },
            ],
        })

        return categories.map(CategoryMapper.toCategoryEntity)
    }

    async findById(categoryId: string): Promise<CategoryEntity | null> {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            include: categoryWithSubcategories,
        });

        return category ? CategoryMapper.toCategoryEntity(category) : null;
    }

    async findBySlug(slug: string): Promise<CategoryEntity | null> {
        const category = await this.prisma.category.findUnique({
            where: { slug },
            include: categoryWithSubcategories,
        });

        return category ? CategoryMapper.toCategoryEntity(category) : null;
    }

    async createCategory(input: CreateCategoryInput,): Promise<CategoryEntity> {
        const category = await this.prisma.category.create({
            data: input,
            include: categoryWithSubcategories,
        });

        return CategoryMapper.toCategoryEntity(category);
    }

    async updateCategory(categoryId: string, input: UpdateCategoryInput,): Promise<CategoryEntity> {
        const category = await this.prisma.category.update({
            where: { id: categoryId },
            data: input,
            include: categoryWithSubcategories,
        });

        return CategoryMapper.toCategoryEntity(category);
    }

    async findSubcategories(categoryId: string,): Promise<SubcategoryEntity[]> {
        const subcategories = await this.prisma.subcategory.findMany({
            where: { categoryId },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });

        return subcategories.map(CategoryMapper.toSubcategoryEntity);
    }

    async findSubcategoryById(categoryId: string, subcategoryId: string,): Promise<SubcategoryEntity | null> {
        const subcategory = await this.prisma.subcategory.findFirst({
            where: {
                id: subcategoryId,
                categoryId,
            },
        });

        return subcategory
            ? CategoryMapper.toSubcategoryEntity(subcategory)
            : null;
    }

    async findSubcategoryBySlug(categoryId: string, slug: string,): Promise<SubcategoryEntity | null> {
        const subcategory = await this.prisma.subcategory.findUnique({
            where: {
                categoryId_slug: {
                    categoryId,
                    slug,
                },
            },
        });

        return subcategory
            ? CategoryMapper.toSubcategoryEntity(subcategory)
            : null;
    }

    async createSubcategory(input: CreateSubcategoryInput,): Promise<SubcategoryEntity> {
        const subcategory = await this.prisma.subcategory.create({
            data: input,
        });

        return CategoryMapper.toSubcategoryEntity(subcategory);
    }

    async updateSubcategory(subcategoryId: string, input: UpdateSubcategoryInput,): Promise<SubcategoryEntity> {
        const subcategory = await this.prisma.subcategory.update({
            where: { id: subcategoryId },
            data: input,
        });

        return CategoryMapper.toSubcategoryEntity(subcategory);
    }
}