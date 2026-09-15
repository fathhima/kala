import { User } from "@prisma/client";
import { AuthUserEntity, UserEntity } from "../entities/user.entity";
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
            hasPassword: Boolean(user.password),
            isVerified: user.isVerified,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }

    static toAuthEntity(user: User): AuthUserEntity {
        return { ...UserMapper.toEntity(user), password: user.password };
    }
}