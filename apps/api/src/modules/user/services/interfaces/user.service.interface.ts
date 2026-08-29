import { CategoryEntity } from "@/modules/category/entities/category.entity";
import { UpdateUserProfileDto } from "../../dto/request/update-user-profile.request.dto";
import { UserEntity } from "../../entities/user.entity";

export const USER_SERVICE = Symbol('USER_SERVICE');

export interface IUserService {
    getMyProfile(userId: string): Promise<UserEntity>;

    updateMyProfile(userId: string, dto: UpdateUserProfileDto,): Promise<UserEntity>;
}