import { UserRole } from "@/shared/enums/role.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserEntity } from "../../entities/user.entity";

export class AdminUserDetailDto {
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
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: AdminUserDetailDto })
    data!: AdminUserDetailDto;

    static fromResult(params: {
        message: string;
        user: UserEntity;
    }): AdminUserResponseDto {
        const dto = new AdminUserResponseDto();

        dto.success = true;
        dto.message = params.message;
        dto.data = AdminUserDetailDto.fromEntity(params.user);

        return dto;
    }
}