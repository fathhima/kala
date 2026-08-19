import { UserEntity } from "@/modules/user/entities/user.entity";
import { UserRole } from "@/shared/enums/role.enum";

export class MeUserDto {
  id!: string;
  name!: string;
  email!: string;
  roles!: UserRole[];
  imageUrl?: string | null;
  isVerified!: boolean;
  isActive!: boolean;
  hasPassword!: boolean;
  createdAt!: Date;
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
  success!: boolean;
  message!: string;
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