import { User } from "@prisma/client";
import { UserEntity } from "../entities/user.entity";
import { AuthUser } from "../types/auth-user.type";
import { UserRole } from "@/shared/enums/role.enum";

export class UserMapper {
    static toEntity(user: User): UserEntity {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles.map(role => role as UserRole),
            imageUrl: user.imageUrl,
            googleId: user.googleId,
            isVerified: user.isVerified,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }

    static toAuthUser(user: User): AuthUser {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            roles: user.roles.map(role => role as UserRole),
            imageUrl: user.imageUrl,
            googleId: user.googleId,
            isVerified: user.isVerified,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}