import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { UserRepository } from './interfaces/user.repository';
import { User } from '../entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { UserQueryDto } from '../dto/user-query.dto';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const raw = await this.prisma.user.create({
      data: userData as Prisma.UserCreateInput,
    });
    return UserMapper.toDomain(raw);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const raw = await this.prisma.user.update({
      where: { id },
      data: data as Prisma.UserUpdateInput,
    });
    return UserMapper.toDomain(raw);
  }

  async find(query: UserQueryDto): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 10, search, role } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(role && { roles: { has: role as unknown as Role } }),
    };

    const [rawUsers, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users: rawUsers.map(UserMapper.toDomain), total };
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    return raw ? UserMapper.toDomain(raw) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}