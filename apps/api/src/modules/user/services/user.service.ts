import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserRepository } from '../repositories/interfaces/user.repository';
import { USER_REPOSITORY } from '../repositories/interfaces/user.repository';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import cuid from '@paralleldrive/cuid2';
import { UpdateUserStatusDto } from '../dto/request/update-user-status.request.dto';

@Injectable()
export class UserService {
  
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) { }

  async findAll(query: UserQueryDto) {
    const { users, total } = await this.userRepository.find(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return {
      total,
      page,
      limit,
      data: users.map(UserResponseDto.fromEntity),
    };
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`User with id "${id}" not found`);
    return UserResponseDto.fromEntity(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? user : null
  }

  async findEntityById(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    return user ? user : null;
  }

  async create(dto: CreateUserDto): Promise<void> {
    const user = new User(cuid.createId(),dto.name,dto.email,dto.password,dto.roles)
    await this.userRepository.create(user)
  }

  async update(id: string, dto: UpdateUserDto): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`User with id "${id}" not found`);
    await this.userRepository.update(id, dto);
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`User with id "${id}" not found`);
    await this.userRepository.update(id, { isActive: dto.status });
  }
  

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`User with id "${id}" not found`);
    await this.userRepository.delete(id);
  }
}