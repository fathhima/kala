import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum UserStatusFilter {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

export class UserQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ example: 'john', description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  search?: string;

  @ApiPropertyOptional({ enum: Role, enumName: 'Role', description: 'Filter by role' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    enum: UserStatusFilter,
    description: 'Filter by account status',
  })
  @IsOptional()
  @IsEnum(UserStatusFilter)
  status?: UserStatusFilter;
}