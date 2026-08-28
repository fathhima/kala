import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import {
    CATEGORY_REPOSITORY,
    type ICategoryRepository,
} from '../../category/repositories/interfaces/category.interface'
import { CategoryEntity } from '../../category/entities/category.entity'
import {
    USER_REPOSITORY,
    type IUserRepository,
} from '../repositories/interfaces/user.interface'
import { UserEntity } from '../entities/user.entity'
import { UpdateUserProfileDto } from '../dto/request/update-user-profile.request.dto'
import { IUserService } from './interfaces/user.service.interface'

@Injectable()
export class UserService implements IUserService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly _userRepository: IUserRepository,
    ) { }

    async getMyProfile(userId: string): Promise<UserEntity> {
        const user = await this._userRepository.findById(userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    async updateMyProfile(userId: string, dto: UpdateUserProfileDto,): Promise<UserEntity> {
        const user = await this._userRepository.findById(userId)

        if (!user) {
            throw new UnauthorizedException('User not found')
        }

        return this._userRepository.updateProfile(userId, {
            name: dto.name?.trim(),
            imageUrl: dto.imageUrl?.trim() || null,
        })
    }
}