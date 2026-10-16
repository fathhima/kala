import { MeResponseDto } from "../../dto/response/me-response.dto";
import { UpdateUserProfileInput } from "../../types/update-user-profile.input.type";

export const USER_SERVICE = Symbol('USER_SERVICE');

export interface IUserService {
    getMyProfile(userId: string): Promise<MeResponseDto>;
    updateMyProfile(userId: string, dto: UpdateUserProfileInput): Promise<MeResponseDto>;
}