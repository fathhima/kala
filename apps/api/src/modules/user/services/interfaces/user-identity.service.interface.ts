import { AuthUserEntity, UserEntity } from '../../entities/user.entity';
import { CreateUserInput } from '../../types/create-user-input.type';
import { UserRole } from '@/shared/enums/role.enum';

export const USER_IDENTITY_SERVICE = Symbol('USER_IDENTITY_SERVICE');

export interface IUserIdentityService {
    findById(id: string): Promise<UserEntity | null>;

    findByEmail(email: string): Promise<UserEntity | null>;

    findAuthById(id: string): Promise<AuthUserEntity | null>;

    findAuthByEmail(email: string): Promise<AuthUserEntity | null>;

    create(input: CreateUserInput): Promise<UserEntity>;

    updatePassword(userId: string, hashedPassword: string): Promise<void>;

    updateGoogleAccount(userId: string, data: { googleId: string; imageUrl?: string | null; isVerified?: boolean },): Promise<UserEntity>;

    assignRole(userId: string, role: UserRole): Promise<void>;
}