import { UserEntity } from "../../entities/user.entity";
import { UpdateUserProfileInput } from "../../types/update-user-profile.input.type";

export const USER_SERVICE = Symbol('USER_SERVICE');

export interface IUserService {
    getMyProfile(userId: string): Promise<UserEntity>;

    updateMyProfile(userId: string, dto: UpdateUserProfileInput): Promise<UserEntity>;
}