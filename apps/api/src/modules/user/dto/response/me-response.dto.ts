import { UserEntity } from "@/modules/user/entities/user.entity";
import { UserRole } from "@/shared/enums/role.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MeUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: UserRole, isArray: true })
  roles!: UserRole[];

  @ApiPropertyOptional({ type: String, nullable: true })
  imageUrl?: string | null;

  @ApiProperty()
  isVerified!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  hasPassword!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromEntity(user: UserEntity): MeUserDto {
    const dto = new MeUserDto();

    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.roles = user.roles;
    dto.imageUrl = user.imageUrl ?? null;
    dto.isVerified = user.isVerified;
    dto.isActive = user.isActive;
    dto.hasPassword = user.hasPassword;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;

    return dto;
  }
}

export class MeResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: MeUserDto })
  data!: MeUserDto;

  static fromResult(params: {
    message: string;
    user: UserEntity;
  }): MeResponseDto {
    const dto = new MeResponseDto();

    dto.success = true;
    dto.message = params.message;
    dto.data = MeUserDto.fromEntity(params.user);

    return dto;
  }
}