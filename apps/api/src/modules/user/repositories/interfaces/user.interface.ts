import { UserRole } from '@/shared/enums/role.enum';
import { AuthUserEntity, UserEntity } from '../../entities/user.entity';
import { CreateUserInput } from '../../types/create-user-input.type';
import { IBaseRepository, TransactionClient } from '@/shared/prisma/base';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository extends IBaseRepository<UserEntity> {
  findByEmail(
    email: string,
    tx?: TransactionClient,
  ): Promise<UserEntity | null>;

  findById(id: string, tx?: TransactionClient): Promise<UserEntity | null>;

  exists(id: string, tx?: TransactionClient): Promise<boolean>;

  findAuthByEmail(
    email: string,
    tx?: TransactionClient,
  ): Promise<AuthUserEntity | null>;

  create(data: CreateUserInput, tx?: TransactionClient): Promise<UserEntity>;

  updateProfile(
    userId: string,
    data: { name?: string; imageUrl?: string | null },
    tx?: TransactionClient,
  ): Promise<UserEntity>;

  updatePassword(
    userId: string,
    hashedPassword: string,
    tx?: TransactionClient,
  ): Promise<void>;

  updateGoogleAccount(
    userId: string,
    data: {
      googleId: string;
      imageUrl?: string | null;
      isVerified?: boolean;
    },
    tx?: TransactionClient,
  ): Promise<UserEntity>;

  findAuthById(
    id: string,
    tx?: TransactionClient,
  ): Promise<AuthUserEntity | null>;

  assignRole(
    userId: string,
    role: UserRole,
    tx?: TransactionClient,
  ): Promise<void>;
}
