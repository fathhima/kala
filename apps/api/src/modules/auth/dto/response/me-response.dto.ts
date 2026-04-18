import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UserEntity } from '@/modules/user/entities/user.entity';

export class MeResponseDto {
  @ApiProperty({ example: 'cuid1234' })
  id!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiProperty({ enum: Role, isArray: true, example: [Role.STUDENT] })
  roles!: Role[];

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/avatar.png',
    nullable: true,
  })
  imageUrl!: string | null;

  @ApiProperty({ example: true })
  isVerified!: boolean;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  static fromEntity(user: UserEntity): MeResponseDto {
    const dto = new MeResponseDto();
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