import { UserEntity } from "../../entities/user.entity";
import { AuthUser } from "../../types/auth-user.type";
import { CreateUserInput } from "../../types/create-user-input.type";

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

export interface UserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>
  findAuthByEmail(email: string): Promise<AuthUser | null>;
  create(data: CreateUserInput): Promise<UserEntity>;
}