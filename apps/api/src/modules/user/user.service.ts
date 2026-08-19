import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import {
    CATEGORY_REPOSITORY,
    type CategoryRepository,
} from '../category/repositories/interfaces/category.repository'
import { CategoryEntity } from '../category/entities/category.entity'
import {
    USER_REPOSITORY,
    type UserRepository,
} from './repositories/interfaces/user.repository'
import { UserEntity } from './entities/user.entity'
import { UpdateUserProfileDto } from './dto/request/update-user-profile.request.dto'

@Injectable()
export class UserService {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: CategoryRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) { }

    async findSelectable(): Promise<CategoryEntity[]> {
        return this.categoryRepository.findSelectable()
    }

    async updateMyProfile(userId: string, dto: UpdateUserProfileDto,): Promise<UserEntity> {
        const user = await this.userRepository.findById(userId)

        if (!user) {
            throw new UnauthorizedException('User not found')
        }

        return this.userRepository.updateProfile(userId, {
            name: dto.name?.trim(),
            imageUrl: dto.imageUrl?.trim() || null,
        })
    }
}