import { PrismaService } from "@/shared/prisma/prisma.service";
import { UserRepository } from "./interfaces/user.repository";
import { UserMapper } from "../mappers/user.mapper";
import { CreateUserInput } from "../types/create-user-input.type";
import { Prisma, Role } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { UserEntity } from "../entities/user.entity";
import { AdminUserListParams } from "../types/admin-user-list-params.type";
import { PaginatedResult } from "@/shared/types";

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    })
    return user ? UserMapper.toEntity(user) : null
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    })
    return user ? UserMapper.toEntity(user) : null
  }

  async findAuthByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    })
    return user ? UserMapper.toAuthUser(user) : null
  }

  async create(data: CreateUserInput) {
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        googleId: data.googleId ?? null,
        roles: data.roles ?? [Role.STUDENT],
        imageUrl: data.imageUrl ?? null,
        isVerified: data.isVerified ?? false,
        isActive: data.isActive ?? true
      }
    })

    return UserMapper.toEntity(user)
  }

  async updatePassword(userId: string, hashedPassword: string) {
    await this.prisma.user.update({
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
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        googleId: data.googleId,
        imageUrl: data.imageUrl ?? null,
        isVerified: data.isVerified ?? true,
      },
    });

    return UserMapper.toEntity(user);
  }

  async findManyForAdmin(params: AdminUserListParams): Promise<PaginatedResult<UserEntity>> {
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

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map((user) => UserMapper.toEntity(user)),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async updateStatus(userId: string, isActive: boolean): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    return UserMapper.toEntity(user);
  }
}