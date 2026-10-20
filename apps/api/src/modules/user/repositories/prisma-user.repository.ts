import { PrismaService } from '@/shared/prisma/prisma.service';
import { IUserRepository } from './interfaces/user.interface';
import { UserMapper } from '../mappers/user.mapper';
import { CreateUserInput } from '../types/create-user-input.type';
import { Injectable } from '@nestjs/common';
import { AuthUserEntity, UserEntity } from '../entities/user.entity';
import { AdminUserListParams } from '../types/admin-user-list-params.type';
import { IPaginatedResult } from '@/shared/types';
import { IAdminUserRepository } from '@/modules/user/repositories/interfaces/admin-user.interface';
import { UserRole } from '@/shared/enums/role.enum';
import { Prisma } from '@prisma/client';
import { BasePrismaRepository, TransactionClient } from '@/shared/prisma/base';

@Injectable()
export class PrismaUserRepository
  extends BasePrismaRepository
  implements IUserRepository, IAdminUserRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByEmail(
    email: string,
    tx?: TransactionClient,
  ): Promise<UserEntity | null> {
    const user = await this.getClient(tx).user.findUnique({
      where: { email },
    });
    return user ? UserMapper.toEntity(user) : null;
  }

  async findById(
    id: string,
    tx?: TransactionClient,
  ): Promise<UserEntity | null> {
    const user = await this.getClient(tx).user.findUnique({
      where: { id },
    });
    return user ? UserMapper.toEntity(user) : null;
  }

  async exists(id: string, tx?: TransactionClient): Promise<boolean> {
    return this.checkExists(this.getClient(tx).user, { id });
  }

  async findAuthByEmail(
    email: string,
    tx?: TransactionClient,
  ): Promise<AuthUserEntity | null> {
    const user = await this.getClient(tx).user.findUnique({
      where: { email },
    });
    return user ? UserMapper.toAuthEntity(user) : null;
  }

  async create(
    data: CreateUserInput,
    tx?: TransactionClient,
  ): Promise<UserEntity> {
    try {
      const user = await this.getClient(tx).user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          googleId: data.googleId ?? null,
          roles: data.roles ?? [UserRole.STUDENT],
          imageUrl: data.imageUrl ?? null,
          isVerified: data.isVerified ?? false,
          isActive: data.isActive ?? true,
        },
      });

      return UserMapper.toEntity(user);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updateProfile(
    userId: string,
    data: { name?: string; imageUrl?: string | null },
    tx?: TransactionClient,
  ): Promise<UserEntity> {
    const user = await this.getClient(tx).user.update({
      where: { id: userId },
      data,
    });

    return UserMapper.toEntity(user);
  }

  async updatePassword(
    userId: string,
    hashedPassword: string,
    tx?: TransactionClient,
  ): Promise<void> {
    await this.getClient(tx).user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async updateGoogleAccount(
    userId: string,
    data: {
      googleId: string;
      imageUrl?: string | null;
      isVerified?: boolean;
    },
    tx?: TransactionClient,
  ): Promise<UserEntity> {
    const user = await this.getClient(tx).user.update({
      where: { id: userId },
      data: {
        googleId: data.googleId,
        imageUrl: data.imageUrl ?? null,
        isVerified: data.isVerified ?? true,
      },
    });

    return UserMapper.toEntity(user);
  }

  async findManyForAdmin(
    params: AdminUserListParams,
    tx?: TransactionClient,
  ): Promise<IPaginatedResult<UserEntity>> {
    const where: Prisma.UserWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.role) {
      where.roles = { has: params.role };
    }

    if (typeof params.isActive === 'boolean') {
      where.isActive = params.isActive;
    }

    return this.paginate({
      delegate: this.getClient(tx).user,
      where,
      orderBy: { createdAt: 'desc' },
      pagination: { page: params.page, limit: params.limit },
      mapper: UserMapper.toEntity,
      tx,
    });
  }

  async updateStatus(
    userId: string,
    isActive: boolean,
    tx?: TransactionClient,
  ): Promise<UserEntity> {
    const user = await this.getClient(tx).user.update({
      where: { id: userId },
      data: { isActive },
    });

    return UserMapper.toEntity(user);
  }

  async findAuthById(
    id: string,
    tx?: TransactionClient,
  ): Promise<AuthUserEntity | null> {
    const user = await this.getClient(tx).user.findUnique({ where: { id } });

    return user ? UserMapper.toAuthEntity(user) : null;
  }

  async assignRole(
    userId: string,
    role: UserRole,
    tx?: TransactionClient,
  ): Promise<void> {
    const client = this.getClient(tx);
    const user = await client.user.findUnique({ where: { id: userId } });

    if (!user) return;
    if (user.roles.includes(role)) return;

    await client.user.update({
      where: { id: userId },
      data: { roles: { set: [...user.roles, role] } },
    });
  }
}
