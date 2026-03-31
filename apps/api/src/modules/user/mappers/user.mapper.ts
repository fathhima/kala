import { Role } from '@prisma/client';
import { User, UserRole } from '../entities/user.entity';

type PrismaUserRecord = {
  id: string;
  name: string;
  email: string;
  password: string | null;
  roles: Role[];
  imageUrl: string | null;
  googleId: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class UserMapper {
  static toDomain(raw: PrismaUserRecord): User {
    return {
      id : raw.id,
      name : raw.name,
      email : raw.email,
      password : raw.password,
      roles : raw.roles as unknown as UserRole[],
      imageUrl : raw.imageUrl,
      googleId : raw.googleId,
      isVerified : raw.isVerified,
      isActive : raw.isActive,
      createdAt : raw.createdAt,
      updatedAt : raw.updatedAt,
    }
  }
}
