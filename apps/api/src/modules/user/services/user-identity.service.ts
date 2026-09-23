import { Inject, Injectable } from '@nestjs/common';
import { UserRole } from '@/shared/enums/role.enum';
import { IUserIdentityService } from './interfaces/user-identity.service.interface';
import { USER_REPOSITORY, type IUserRepository } from '../repositories/interfaces/user.interface';
import { CreateUserInput } from '../types/create-user-input.type';

@Injectable()
export class UserIdentityService implements IUserIdentityService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly _userRepository: IUserRepository,
    ) { }

    findById(id: string) {
        return this._userRepository.findById(id);
    }

    findByEmail(email: string) {
        return this._userRepository.findByEmail(email);
    }

    findAuthById(id: string) {
        return this._userRepository.findAuthById(id);
    }

    findAuthByEmail(email: string) {
        return this._userRepository.findAuthByEmail(email);
    }

    create(input: CreateUserInput) {
        return this._userRepository.create(input);
    }

    updatePassword(userId: string, hashedPassword: string) {
        return this._userRepository.updatePassword(userId, hashedPassword);
    }

    updateGoogleAccount(userId: string, data: { googleId: string; imageUrl?: string | null; isVerified?: boolean }) {
        return this._userRepository.updateGoogleAccount(userId, data);
    }

    assignRole(userId: string, role: UserRole) {
        return this._userRepository.assignRole(userId, role);
    }
}