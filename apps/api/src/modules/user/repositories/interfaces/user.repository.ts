import { User } from '../../entities/user.entity';
import { UserQueryDto } from '../../dto/user-query.dto';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepository {
  create(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  find(query: UserQueryDto): Promise<{ users: User[]; total: number }>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  delete(id: string): Promise<void>;
}