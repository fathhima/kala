import { UserEntity } from '@/modules/user/entities/user.entity';
import { AdminUserListParams } from '@/modules/user/types/admin-user-list-params.type';
import { IPaginatedResult } from '@/shared/types';
import { IAdminListRepository, TransactionClient } from '@/shared/prisma/base';

export const ADMIN_USER_REPOSITORY = Symbol('ADMIN_USER_REPOSITORY');

export interface IAdminUserRepository extends IAdminListRepository<
  UserEntity,
  AdminUserListParams
> {
  findManyForAdmin(
    params: AdminUserListParams,
    tx?: TransactionClient,
  ): Promise<IPaginatedResult<UserEntity>>;

  updateStatus(
    userId: string,
    isActive: boolean,
    tx?: TransactionClient,
  ): Promise<UserEntity>;
}
