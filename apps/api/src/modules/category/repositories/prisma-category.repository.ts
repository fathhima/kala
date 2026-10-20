import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { BasePrismaRepository, TransactionClient } from '@/shared/prisma/base';
import { CategoryEntity } from '../entities/category.entity';
import { SubcategoryEntity } from '../entities/subcategory.entity';
import { CategoryMapper } from '../mappers/category.mapper';
import { CreateCategoryInput } from '../types/create-category-input.type';
import { CreateSubcategoryInput } from '../types/create-subcategory-input.type';
import { UpdateCategoryInput } from '../types/update-category-input.type';
import { UpdateSubcategoryInput } from '../types/update-subcategory-input.type';
import { CategoryListParams } from '../types/category-list-params.type';
import { IPaginatedResult } from '@/shared/types/paginated-result';
import { ICategoryRepository } from './interfaces/category.interface';

const categoryWithSubcategories = {
  subcategories: {
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  },
} satisfies Prisma.CategoryInclude;

@Injectable()
export class PrismaCategoryRepository
  extends BasePrismaRepository
  implements ICategoryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findManyForAdmin(
    params: CategoryListParams,
    tx?: TransactionClient,
  ): Promise<IPaginatedResult<CategoryEntity>> {
    const where: Prisma.CategoryWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (typeof params.isActive === 'boolean') {
      where.isActive = params.isActive;
    }

    return this.paginate({
      delegate: this.getClient(tx).category,
      where,
      include: categoryWithSubcategories,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      pagination: { page: params.page, limit: params.limit },
      mapper: CategoryMapper.toCategoryEntity,
      tx,
    });
  }

  async findAll(tx?: TransactionClient): Promise<CategoryEntity[]> {
    const categories = await this.getClient(tx).category.findMany({
      include: categoryWithSubcategories,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return categories.map(CategoryMapper.toCategoryEntity);
  }

  async findSelectable(tx?: TransactionClient): Promise<CategoryEntity[]> {
    const categories = await this.getClient(tx).category.findMany({
      where: {
        isActive: true,
      },
      include: {
        subcategories: {
          where: {
            isActive: true,
          },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return categories.map(CategoryMapper.toCategoryEntity);
  }

  async findById(
    categoryId: string,
    tx?: TransactionClient,
  ): Promise<CategoryEntity | null> {
    const category = await this.getClient(tx).category.findUnique({
      where: { id: categoryId },
      include: categoryWithSubcategories,
    });

    return category ? CategoryMapper.toCategoryEntity(category) : null;
  }

  async exists(categoryId: string, tx?: TransactionClient): Promise<boolean> {
    return this.checkExists(this.getClient(tx).category, { id: categoryId });
  }

  async findBySlug(
    slug: string,
    tx?: TransactionClient,
  ): Promise<CategoryEntity | null> {
    const category = await this.getClient(tx).category.findUnique({
      where: { slug },
      include: categoryWithSubcategories,
    });

    return category ? CategoryMapper.toCategoryEntity(category) : null;
  }

  async create(
    input: CreateCategoryInput,
    tx?: TransactionClient,
  ): Promise<CategoryEntity> {
    const category = await this.getClient(tx).category.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        sortOrder: input.sortOrder ?? 0,
      },
      include: categoryWithSubcategories,
    });

    return CategoryMapper.toCategoryEntity(category);
  }

  async createCategory(
    input: CreateCategoryInput,
    tx?: TransactionClient,
  ): Promise<CategoryEntity> {
    return this.create(input, tx);
  }

  async update(
    categoryId: string,
    input: UpdateCategoryInput,
    tx?: TransactionClient,
  ): Promise<CategoryEntity> {
    const category = await this.getClient(tx).category.update({
      where: { id: categoryId },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        imageUrl: input.imageUrl,
        imageStorageKey: input.imageStorageKey,
        isActive: input.isActive,
        sortOrder: input.sortOrder,
      },
      include: categoryWithSubcategories,
    });

    return CategoryMapper.toCategoryEntity(category);
  }

  async updateCategory(
    categoryId: string,
    input: UpdateCategoryInput,
    tx?: TransactionClient,
  ): Promise<CategoryEntity> {
    return this.update(categoryId, input, tx);
  }

  async findSubcategories(
    categoryId: string,
    tx?: TransactionClient,
  ): Promise<SubcategoryEntity[]> {
    const subcategories = await this.getClient(tx).subcategory.findMany({
      where: { categoryId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return subcategories.map(CategoryMapper.toSubcategoryEntity);
  }

  async findSubcategoryByGlobalId(
    subcategoryId: string,
    tx?: TransactionClient,
  ): Promise<SubcategoryEntity | null> {
    const subcategory = await this.getClient(tx).subcategory.findUnique({
      where: {
        id: subcategoryId,
      },
    });

    return subcategory ? CategoryMapper.toSubcategoryEntity(subcategory) : null;
  }

  async findSubcategoryById(
    categoryId: string,
    subcategoryId: string,
    tx?: TransactionClient,
  ): Promise<SubcategoryEntity | null> {
    const subcategory = await this.getClient(tx).subcategory.findFirst({
      where: {
        id: subcategoryId,
        categoryId,
      },
    });

    return subcategory ? CategoryMapper.toSubcategoryEntity(subcategory) : null;
  }

  async findSubcategoryBySlug(
    categoryId: string,
    slug: string,
    tx?: TransactionClient,
  ): Promise<SubcategoryEntity | null> {
    const subcategory = await this.getClient(tx).subcategory.findUnique({
      where: {
        categoryId_slug: {
          categoryId,
          slug,
        },
      },
    });

    return subcategory ? CategoryMapper.toSubcategoryEntity(subcategory) : null;
  }

  async createSubcategory(
    categoryId: string,
    input: CreateSubcategoryInput,
    tx?: TransactionClient,
  ): Promise<SubcategoryEntity> {
    const subcategory = await this.getClient(tx).subcategory.create({
      data: {
        categoryId,
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        sortOrder: input.sortOrder ?? 0,
      },
    });

    return CategoryMapper.toSubcategoryEntity(subcategory);
  }

  async updateSubcategory(
    subcategoryId: string,
    input: UpdateSubcategoryInput,
    tx?: TransactionClient,
  ): Promise<SubcategoryEntity> {
    const subcategory = await this.getClient(tx).subcategory.update({
      where: { id: subcategoryId },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        imageUrl: input.imageUrl,
        imageStorageKey: input.imageStorageKey,
        isActive: input.isActive,
        sortOrder: input.sortOrder,
      },
    });

    return CategoryMapper.toSubcategoryEntity(subcategory);
  }
}
