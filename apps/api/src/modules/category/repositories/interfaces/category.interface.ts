import { IPaginatedResult } from '@/shared/types/paginated-result';
import { CategoryEntity } from '../../entities/category.entity';
import { CategoryListParams } from '../../types/category-list-params.type';
import { CreateCategoryInput } from '../../types/create-category-input.type';
import { UpdateCategoryInput } from '../../types/update-category-input.type';
import { SubcategoryEntity } from '../../entities/subcategory.entity';
import { CreateSubcategoryInput } from '../../types/create-subcategory-input.type';
import { UpdateSubcategoryInput } from '../../types/update-subcategory-input.type';
import {
  ICrudRepository,
  IAdminListRepository,
  TransactionClient,
} from '@/shared/prisma/base';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface ICategoryRepository
  extends
    ICrudRepository<CategoryEntity, CreateCategoryInput, UpdateCategoryInput>,
    IAdminListRepository<CategoryEntity, CategoryListParams> {
  findSelectable(tx?: TransactionClient): Promise<CategoryEntity[]>;

  findManyForAdmin(
    params: CategoryListParams,
    tx?: TransactionClient,
  ): Promise<IPaginatedResult<CategoryEntity>>;

  findAll(tx?: TransactionClient): Promise<CategoryEntity[]>;

  findById(
    categoryId: string,
    tx?: TransactionClient,
  ): Promise<CategoryEntity | null>;

  exists(categoryId: string, tx?: TransactionClient): Promise<boolean>;

  findBySlug(
    slug: string,
    tx?: TransactionClient,
  ): Promise<CategoryEntity | null>;

  create(
    input: CreateCategoryInput,
    tx?: TransactionClient,
  ): Promise<CategoryEntity>;

  createCategory(
    input: CreateCategoryInput,
    tx?: TransactionClient,
  ): Promise<CategoryEntity>;

  update(
    categoryId: string,
    input: UpdateCategoryInput,
    tx?: TransactionClient,
  ): Promise<CategoryEntity>;

  updateCategory(
    categoryId: string,
    input: UpdateCategoryInput,
    tx?: TransactionClient,
  ): Promise<CategoryEntity>;

  findSubcategories(
    categoryId: string,
    tx?: TransactionClient,
  ): Promise<SubcategoryEntity[]>;

  findSubcategoryByGlobalId(
    subcategoryId: string,
    tx?: TransactionClient,
  ): Promise<SubcategoryEntity | null>;

  findSubcategoryById(
    categoryId: string,
    subcategoryId: string,
    tx?: TransactionClient,
  ): Promise<SubcategoryEntity | null>;

  findSubcategoryBySlug(
    categoryId: string,
    slug: string,
    tx?: TransactionClient,
  ): Promise<SubcategoryEntity | null>;

  createSubcategory(
    categoryId: string,
    input: CreateSubcategoryInput,
    tx?: TransactionClient,
  ): Promise<SubcategoryEntity>;

  updateSubcategory(
    subcategoryId: string,
    input: UpdateSubcategoryInput,
    tx?: TransactionClient,
  ): Promise<SubcategoryEntity>;
}
