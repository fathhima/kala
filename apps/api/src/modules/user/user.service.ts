import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { USER_REPOSITORY } from "./repositories/interfaces/user.repository";
import type { UserRepository } from "./repositories/interfaces/user.repository";
import { UserQueryDto, UserStatusFilter } from "./dto/request/user-query.dto";
import { UpdateUserStatusDto } from "./dto/request/update-user-status.request.dto";
import { RedisService } from "@/shared/redis/redis.service";
import { UserRole } from "@/shared/enums/role.enum";
import { UserEntity } from "./entities/user.entity";
import { PaginatedResult } from "@/shared/types";

@Injectable()
export class UserService {
    constructor(@Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
        private readonly redisService: RedisService,
    ) { }

    async getAdminUsers(query: UserQueryDto): Promise<PaginatedResult<UserEntity>> {
        const isActive =
            query.status === UserStatusFilter.ACTIVE
                ? true
                : query.status === UserStatusFilter.BLOCKED
                    ? false
                    : undefined;

        return this.userRepository.findManyForAdmin({
            page: query.page ?? 1,
            limit: query.limit ?? 10,
            search: query.search,
            role: query.role,
            isActive,
        });
    }

    async updateAdminUserStatus(
        targetUserId: string,
        dto: UpdateUserStatusDto,
        adminUserId: string,
    ): Promise<UserEntity> {
        const targetUser = await this.userRepository.findById(targetUserId);

        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        if (!dto.isActive) {
            if (targetUser.id === adminUserId) {
                throw new BadRequestException('You cannot block your own account');
            }

            if (targetUser.roles.includes(UserRole.ADMIN)) {
                throw new ConflictException('Admin accounts cannot be blocked');
            }
        }

        const updatedUser =
            targetUser.isActive === dto.isActive
                ? targetUser
                : await this.userRepository.updateStatus(targetUserId, dto.isActive);

        if (!updatedUser.isActive) {
            await this.redisService.deleteAllUserRefreshSessions(updatedUser.id);
        }

        return updatedUser
    }

    async getAdminUserById(id: string): Promise<UserEntity> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user
    }
}