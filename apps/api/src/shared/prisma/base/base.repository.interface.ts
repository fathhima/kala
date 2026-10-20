import { IPaginatedResult } from '@/shared/types/paginated-result';
import { Prisma } from '@prisma/client';

export type TransactionClient = Prisma.TransactionClient;

export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Base repository contract for entities that can be looked up by ID.
 */
export interface IBaseRepository<TEntity, TId = string> {
  findById(id: TId, tx?: TransactionClient): Promise<TEntity | null>;
  exists(id: TId, tx?: TransactionClient): Promise<boolean>;
}

/**
 * Standard interface for repositories supporting admin paginated listing.
 */
export interface IAdminListRepository<
  TEntity,
  TParams extends PaginationOptions = PaginationOptions,
> {
  findManyForAdmin(
    params: TParams,
    tx?: TransactionClient,
  ): Promise<IPaginatedResult<TEntity>>;
}

/**
 * Standard interface for basic CRUD repository operations.
 */
export interface ICrudRepository<
  TEntity,
  TCreateInput,
  TUpdateInput,
  TId = string,
> extends IBaseRepository<TEntity, TId> {
  create(data: TCreateInput, tx?: TransactionClient): Promise<TEntity>;
  update(id: TId, data: TUpdateInput, tx?: TransactionClient): Promise<TEntity>;
  deleteById?(id: TId, tx?: TransactionClient): Promise<void>;
}
