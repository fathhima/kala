import { UserEntity } from "@/modules/user/entities/user.entity";
import { UserRole } from "@/shared/enums/role.enum";
import { ApiProperty } from "@nestjs/swagger";

export class SafeUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: UserRole, isArray: true, enumName: "Role" })
  roles!: UserRole[];

  @ApiProperty({ nullable: true })
  imageUrl?: string | null;

  @ApiProperty()
  isVerified!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  hasPassword!: boolean;

  static fromEntity(user: UserEntity): SafeUserDto {
    const dto = new SafeUserDto()

    dto.id = user.id
    dto.name = user.name
    dto.email = user.email
    dto.roles = user.roles
    dto.imageUrl = user.imageUrl ?? null
    dto.isVerified = user.isVerified
    dto.isActive = user.isActive
    dto.hasPassword = user.hasPassword

    return dto
  }
}

export class AuthDataDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: SafeUserDto })
  user!: SafeUserDto;

  static create(
    accessToken: string,
    user: UserEntity
  ): AuthDataDto {
    const dto = new AuthDataDto()

    dto.accessToken = accessToken;
    dto.user = SafeUserDto.fromEntity(user)

    return dto
  }
}

export class AuthResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: AuthDataDto })
  data!: AuthDataDto;

  static fromResult(params: {
    message: string;
    user: UserEntity;
    accessToken: string;
  }): AuthResponseDto {
    const dto = new AuthResponseDto()

    dto.success = true;
    dto.message = params.message;
    dto.data = AuthDataDto.create(params.accessToken, params.user)

    return dto
  }
}