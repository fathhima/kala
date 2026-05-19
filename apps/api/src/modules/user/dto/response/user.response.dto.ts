import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UserEntity } from '@/modules/user/entities/user.entity';

export class AdminUserListItemDto {
    @ApiProperty({ example: 'cuid1234' })
    id!: string;

    @ApiProperty({ example: 'John Doe' })
    name!: string;

    @ApiProperty({ example: 'john@example.com' })
    email!: string;

    @ApiProperty({ enum: Role, isArray: true, enumName: 'Role', example: [Role.STUDENT] })
    roles!: Role[];

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
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Users fetched successfully' })
    message!: string;

    @ApiProperty({ type: PaginatedAdminUsersDataDto })
    data!: PaginatedAdminUsersDataDto;
}

export class AdminUserStatusDataDto {
    @ApiProperty({ example: 'cuid1234' })
    id!: string;

    @ApiProperty({ example: false })
    isActive!: boolean;

    static fromEntity(user: UserEntity): AdminUserStatusDataDto {
        const dto = new AdminUserStatusDataDto();
        dto.id = user.id;
        dto.isActive = user.isActive;
        return dto;
    }
}

export class AdminUserStatusResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'User blocked successfully' })
    message!: string;

    @ApiProperty({ type: AdminUserStatusDataDto })
    data!: AdminUserStatusDataDto;
}

export class AdminUserDetailDto {
    @ApiProperty({ example: 'cuid1234' })
    id!: string;

    @ApiProperty({ example: 'John Doe' })
    name!: string;

    @ApiProperty({ example: 'john@example.com' })
    email!: string;

    @ApiProperty({ enum: Role, isArray: true, enumName: 'Role', example: [Role.STUDENT] })
    roles!: Role[];

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

    @ApiProperty({ example: '2026-01-02T00:00:00.000Z' })
    updatedAt!: Date;

    static fromEntity(user: UserEntity): AdminUserDetailDto {
        const dto = new AdminUserDetailDto();
        dto.id = user.id;
        dto.name = user.name;
        dto.email = user.email;
        dto.roles = user.roles;
        dto.imageUrl = user.imageUrl ?? null;
        dto.isVerified = user.isVerified;
        dto.isActive = user.isActive;
        dto.createdAt = user.createdAt;
        dto.updatedAt = user.updatedAt;
        return dto;
    }
}

export class AdminUserResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'User fetched successfully' })
    message!: string;

    @ApiProperty({ type: AdminUserDetailDto })
    data!: AdminUserDetailDto;
}