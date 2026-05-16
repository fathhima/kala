import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";

class SafeUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: Role, isArray: true, enumName: "Role" })
  roles!: Role[];

  @ApiProperty({ nullable: true })
  imageUrl?: string | null;

  @ApiProperty()
  isVerified!: boolean;

  @ApiProperty()
  isActive!: boolean;
}

class AuthDataDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: SafeUserDto })
  user!: SafeUserDto;
}

export class AuthResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: AuthDataDto })
  data!: AuthDataDto;
}