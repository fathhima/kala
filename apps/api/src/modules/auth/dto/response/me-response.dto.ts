import { User } from '@/modules/user/entities/user.entity';
import { UserRole } from '@/shared/enums/role.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MeResponseDto {
    @ApiProperty({ example: 'cuid1234' })
    id: string;

    @ApiProperty({ example: 'John Doe' })
    name: string;

    @ApiProperty({ example: 'john@example.com' })
    email: string;

    @ApiProperty({ enum: UserRole, isArray: true, example: [UserRole.STUDENT] })
    roles: UserRole[];

    @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png', nullable: true })
    imageUrl: string | null;

    @ApiProperty({ example: true })
    isVerified: boolean;

    @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
    createdAt: Date;

    static fromEntity(user: User) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            imageUrl: user.imageUrl,
            isVerified: user.isVerified,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }
    }
}
