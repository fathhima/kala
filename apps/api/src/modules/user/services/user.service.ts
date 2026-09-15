import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { USER_REPOSITORY, type IUserRepository, } from '../repositories/interfaces/user.interface'
import { UserEntity } from '../entities/user.entity'
import { IUserService } from './interfaces/user.service.interface'
import { UpdateUserProfileInput } from '../types/update-user-profile.input.type'

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

    async updateMyProfile(userId: string, input: UpdateUserProfileInput): Promise<UserEntity> {
        const user = await this._userRepository.findById(userId)

        if (!user) {
            throw new UnauthorizedException('User not found')
        }

        return this._userRepository.updateProfile(userId, {
            name: input.name?.trim(),
            imageUrl: input.imageUrl?.trim() || null,
        })
    }
}