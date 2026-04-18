import { PrismaService } from "@/shared/prisma/prisma.service";
import { UserRepository } from "./interfaces/user.repository";
import { UserMapper } from "../mappers/user.mapper";
import { CreateUserInput } from "../types/create-user-input.type";
import { Role } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { AuthUser } from "../types/auth-user.type";

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
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
}