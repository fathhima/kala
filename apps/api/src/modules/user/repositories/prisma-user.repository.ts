import { PrismaService } from "@/shared/prisma/prisma.service";
import { IUserRepository } from "./interfaces/user.interface";
import { UserMapper } from "../mappers/user.mapper";
import { CreateUserInput } from "../types/create-user-input.type";
import { Injectable } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";
import { AdminUserListParams } from "../types/admin-user-list-params.type";
import { IPaginatedResult } from "@/shared/types";
import { IAdminUserRepository } from "@/modules/user/repositories/interfaces/admin-user.interface";
import { UserRole } from "@/shared/enums/role.enum";
import { Prisma } from "@prisma/client";
import { UniqueConstraintError } from "@/shared/errors/unique-constraint.error";

@Injectable()
export class PrismaUserRepository implements IUserRepository, IAdminUserRepository {
  constructor(private readonly _prisma: PrismaService) { }

  async findByEmail(email: string) {
    const user = await this._prisma.user.findUnique({
      where: { email }
    })
    return user ? UserMapper.toEntity(user) : null
  }

  async findById(id: string) {
    const user = await this._prisma.user.findUnique({
      where: { id }
    })
    return user ? UserMapper.toEntity(user) : null
  }

  async findAuthByEmail(email: string) {
    const user = await this._prisma.user.findUnique({
      where: { email }
    })
    return user ? UserMapper.toAuthEntity(user) : null
  }

  async create(data: CreateUserInput) {
    try {
      const user = await this._prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          googleId: data.googleId ?? null,
          roles: data.roles ?? [UserRole.STUDENT],
          imageUrl: data.imageUrl ?? null,
          isVerified: data.isVerified ?? false,
          isActive: data.isActive ?? true
        }
      })

      return UserMapper.toEntity(user)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new UniqueConstraintError((error.meta?.target as string[] | undefined) ?? ['email'],);
      }
      throw error;
    }
  }

  async updateProfile(userId: string, data: { name?: string; imageUrl?: string | null }): Promise<UserEntity> {
    const user = await this._prisma.user.update({
      where: { id: userId },
      data,
    })

    return UserMapper.toEntity(user)
  }

  async updatePassword(userId: string, hashedPassword: string) {
    await this._prisma.user.update({
      where: {
        id: userId
      },
      data: {
        password: hashedPassword
      }
    })
  }

  async updateGoogleAccount(userId: string,
    data: {
      googleId: string;
      imageUrl?: string | null;
      isVerified?: boolean;
    }) {
    const user = await this._prisma.user.update({
      where: { id: userId },
      data: {
        googleId: data.googleId,
        imageUrl: data.imageUrl ?? null,
        isVerified: data.isVerified ?? true,
      },
    });

    return UserMapper.toEntity(user);
  }

  async findManyForAdmin(params: AdminUserListParams): Promise<IPaginatedResult<UserEntity>> {
    const where: Prisma.UserWhereInput = {};
    const skip = (params.page - 1) * params.limit;

    if (params.search) {
      where.OR = [
        {
          name: {
            contains: params.search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: params.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (params.role) {
      where.roles = {
        has: params.role,
      };
    }

    if (typeof params.isActive === 'boolean') {
      where.isActive = params.isActive;
    }

    const [users, total] = await this._prisma.$transaction([
      this._prisma.user.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this._prisma.user.count({ where }),
    ]);

    return {
      items: users.map((user) => UserMapper.toEntity(user)),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async updateStatus(userId: string, isActive: boolean): Promise<UserEntity> {
    const user = await this._prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    return UserMapper.toEntity(user);
  }
}