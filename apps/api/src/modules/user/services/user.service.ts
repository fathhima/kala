import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { USER_REPOSITORY, type IUserRepository, } from '../repositories/interfaces/user.interface'
import { IUserService } from './interfaces/user.service.interface'
import { UpdateUserProfileInput } from '../types/update-user-profile.input.type'
import { MeResponseDto } from '../dto/response/me-response.dto'

@Injectable()
export class UserService implements IUserService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly _userRepository: IUserRepository,
    ) { }

    async getMyProfile(userId: string): Promise<MeResponseDto> {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return MeResponseDto.fromResult({ message: 'User fetched successfully', user });
    }

    async updateMyProfile(userId: string, input: UpdateUserProfileInput): Promise<MeResponseDto> {
        const user = await this._userRepository.findById(userId)
        if (!user) {
            throw new UnauthorizedException('User not found')
        }
        const updated = await this._userRepository.updateProfile(userId, {
            name: input.name?.trim(),
            imageUrl: input.imageUrl?.trim() || null,
        })
        return MeResponseDto.fromResult({ message: 'Profile updated successfully', user: updated })
    }
}