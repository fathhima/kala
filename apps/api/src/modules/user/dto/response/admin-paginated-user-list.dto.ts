import { UserRole } from "@/shared/enums/role.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserEntity } from "../../entities/user.entity";
import { PaginatedResult } from "@/shared/types/paginated-result";

export class AdminUserListItemDto {
    @ApiProperty({ example: 'cuid1234' })
    id!: string;

    @ApiProperty({ example: 'John Doe' })
    name!: string;

    @ApiProperty({ example: 'john@example.com' })
    email!: string;

    @ApiProperty({ enum: UserRole, isArray: true, enumName: 'Role', example: [UserRole.STUDENT] })
    roles!: UserRole[];

    @ApiPropertyOptional({
        type: String,
        example: 'https://cdn.example.com/avatar.png',
        nullable: true,
    })
    imageUrl?: string | null;

    @ApiProperty({ example: true })
    isVerified!: boolean;

    @ApiProperty({ example: true })
    isActive!: boolean;

    @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
    createdAt!: Date;

    static fromEntity(user: UserEntity): AdminUserListItemDto {
        const dto = new AdminUserListItemDto();
        dto.id = user.id;
        dto.name = user.name;
        dto.email = user.email;
        dto.roles = user.roles;
        dto.imageUrl = user.imageUrl ?? null;
        dto.isVerified = user.isVerified;
        dto.isActive = user.isActive;
        dto.createdAt = user.createdAt;
        return dto;
    }
}

export class PaginationMetaDto {
    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 10 })
    limit!: number;

    @ApiProperty({ example: 124 })
    total!: number;

    @ApiProperty({ example: true })
    hasNextPage!: boolean;

    @ApiProperty({ example: false })
    hasPrevPage!: boolean;

    static create(page: number, limit: number, total: number): PaginationMetaDto {
        const dto = new PaginationMetaDto();
        const totalPages = Math.ceil(total / limit);

        dto.page = page;
        dto.limit = limit;
        dto.total = total;
        dto.hasNextPage = totalPages > 0 ? page < totalPages : false;
        dto.hasPrevPage = page > 1;

        return dto;
    }
}

export class PaginatedAdminUsersDataDto {
    @ApiProperty({ type: [AdminUserListItemDto] })
    items!: AdminUserListItemDto[];

    @ApiProperty({ type: PaginationMetaDto })
    meta!: PaginationMetaDto;
}

export class PaginatedAdminUsersResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: PaginatedAdminUsersDataDto })
    data!: PaginatedAdminUsersDataDto;

    static fromResult(params: {
        message: string;
        result: PaginatedResult<UserEntity>;
    }): PaginatedAdminUsersResponseDto {
        const dto = new PaginatedAdminUsersResponseDto();

        dto.success = true;
        dto.message = params.message;

        dto.data = new PaginatedAdminUsersDataDto();
        dto.data.items = params.result.items.map(AdminUserListItemDto.fromEntity);
        dto.data.meta = PaginationMetaDto.create(
            params.result.page,
            params.result.limit,
            params.result.total,
        );

        return dto;
    }
}