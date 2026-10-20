import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { IPaginatedResult } from '@/shared/types/paginated-result';
import {
  PaginationOptions,
  TransactionClient,
} from './base.repository.interface';
import { UniqueConstraintError } from '@/shared/errors/unique-constraint.error';

export type DbClient = PrismaService | TransactionClient;

export interface PaginateArgs<
  TRecord,
  TEntity,
  TWhereInput = any,
  TOrderByInput = any,
  TIncludeInput = any,
  TSelectInput = any,
> {
  delegate: {
    findMany: (args: any) => Promise<TRecord[]>;
    count: (args: any) => Promise<number>;
  };
  where?: TWhereInput;
  orderBy?: TOrderByInput;
  include?: TIncludeInput;
  select?: TSelectInput;
  pagination: PaginationOptions;
  mapper: (record: TRecord) => TEntity;
  tx?: TransactionClient;
}

/**
 * BasePrismaRepository provides shared database access patterns:
 * - Transaction client propagation (via getClient)
 * - Standardized, safe pagination
 * - Centralized Prisma error handling
 * - Model existence verification
 */
export abstract class BasePrismaRepository {
  constructor(protected readonly prisma: PrismaService) {}

  /**
   * Resolves the database client to use.
   * Returns the active TransactionClient if provided; otherwise falls back to PrismaService.
   */
  protected getClient(tx?: TransactionClient): DbClient {
    return tx ?? this.prisma;
  }

  /**
   * Standardized, type-safe pagination helper.
   * Uses this.prisma.$transaction when outside an interactive transaction for snapshot consistency,
   * or Promise.all if already inside an active transaction.
   */
  protected async paginate<
    TRecord,
    TEntity,
    TWhereInput = any,
    TOrderByInput = any,
    TIncludeInput = any,
    TSelectInput = any,
  >(
    args: PaginateArgs<
      TRecord,
      TEntity,
      TWhereInput,
      TOrderByInput,
      TIncludeInput,
      TSelectInput
    >,
  ): Promise<IPaginatedResult<TEntity>> {
    const page = Math.max(1, args.pagination.page);
    const limit = Math.max(1, args.pagination.limit);
    const skip = (page - 1) * limit;

    const findManyArgs: any = {
      skip,
      take: limit,
    };

    if (args.where !== undefined) findManyArgs.where = args.where;
    if (args.orderBy !== undefined) findManyArgs.orderBy = args.orderBy;
    if (args.include !== undefined) findManyArgs.include = args.include;
    if (args.select !== undefined) findManyArgs.select = args.select;

    const countArgs: any = {};
    if (args.where !== undefined) countArgs.where = args.where;

    let records: TRecord[];
    let total: number;

    if (args.tx) {
      [records, total] = await Promise.all([
        args.delegate.findMany(findManyArgs),
        args.delegate.count(countArgs),
      ]);
    } else {
      [records, total] = await this.prisma.$transaction([
        args.delegate.findMany(findManyArgs) as Prisma.PrismaPromise<TRecord[]>,
        args.delegate.count(countArgs) as Prisma.PrismaPromise<number>,
      ]);
    }

    return {
      items: records.map(args.mapper),
      total,
      page,
      limit,
    };
  }

  /**
   * Executes a callback within a managed transaction.
   */
  protected async runInTransaction<T>(
    operation: (tx: TransactionClient) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): Promise<T> {
    return this.prisma.$transaction(operation, options);
  }

  /**
   * Checks if a record matching the criteria exists.
   */
  protected async checkExists(
    delegate: { findFirst: (args: any) => Promise<any> },
    where: any,
  ): Promise<boolean> {
    const record = await delegate.findFirst({
      where,
      select: { id: true },
    });
    return Boolean(record);
  }

  /**
   * Standardizes Prisma error conversions (P2002 UniqueConstraint, lock timeouts, etc.).
   */
  protected handlePrismaError(error: unknown, fallbackMessage?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[]) ?? [
          'unique_constraint',
        ];
        throw new UniqueConstraintError(target);
      }
    }

    const message = error instanceof Error ? error.message : '';
    if (message.includes('lock timeout') || message.includes('55P03')) {
      throw new Error(
        'Database operation timed out waiting for a row lock. Please retry.',
      );
    }

    if (fallbackMessage && error instanceof Error) {
      error.message = `${fallbackMessage}: ${error.message}`;
    }

    throw error;
  }
}
