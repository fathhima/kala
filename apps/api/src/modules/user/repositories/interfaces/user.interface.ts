import { UserEntity } from "../../entities/user.entity";
import { CreateUserInput } from "../../types/create-user-input.type";

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>
  findAuthByEmail(email: string): Promise<UserEntity | null>;
  create(data: CreateUserInput): Promise<UserEntity>;
  updateProfile(userId: string, data: { name?: string; imageUrl?: string | null },): Promise<UserEntity>
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  updateGoogleAccount(userId: string,
    data: {
      googleId: string;
      imageUrl?: string | null;
      isVerified?: boolean;
    }): Promise<UserEntity>;
}