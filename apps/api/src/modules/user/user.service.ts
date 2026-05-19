import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { USER_REPOSITORY } from "./repositories/interfaces/user.repository";
import type { UserRepository } from "./repositories/interfaces/user.repository";
import { UserQueryDto, UserStatusFilter } from "./dto/request/user-query.dto";
import { AdminUserDetailDto, AdminUserListItemDto, AdminUserStatusDataDto, PaginatedAdminUsersDataDto, PaginationMetaDto } from "./dto/response/user.response.dto";
import { UpdateUserStatusDto } from "./dto/request/update-user-status.request.dto";
import { Role } from "@prisma/client";
import { RedisService } from "@/shared/redis/redis.service";

@Injectable()
export class UserService {
    constructor(@Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
        private readonly redisService: RedisService,
    ) { }

    async getAdminUsers(query: UserQueryDto): Promise<PaginatedAdminUsersDataDto> {
        const isActive =
            query.status === UserStatusFilter.ACTIVE
                ? true
                : query.status === UserStatusFilter.BLOCKED
                    ? false
                    : undefined;

        const result = await this.userRepository.findManyForAdmin({
            page: query.page ?? 1,
            limit: query.limit ?? 10,
            search: query.search,
            role: query.role,
            isActive,
        });

        const data = new PaginatedAdminUsersDataDto();
        data.items = result.items.map((user) => AdminUserListItemDto.fromEntity(user));
        data.meta = PaginationMetaDto.create(result.page, result.limit, result.total);

        return data;
    }

    async updateAdminUserStatus(
        targetUserId: string,
        dto: UpdateUserStatusDto,
        adminUserId: string,
    ): Promise<AdminUserStatusDataDto> {
        const targetUser = await this.userRepository.findById(targetUserId);

        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        if (!dto.isActive) {
            if (targetUser.id === adminUserId) {
                throw new BadRequestException('You cannot block your own account');
            }

            if (targetUser.roles.includes(Role.ADMIN)) {
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

        return AdminUserStatusDataDto.fromEntity(updatedUser);
    }

    async getAdminUserById(id: string): Promise<AdminUserDetailDto> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return AdminUserDetailDto.fromEntity(user);
    }
}