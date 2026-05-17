import { ApiProperty } from "@nestjs/swagger";

class RegisterPendingDataDto {
  @ApiProperty()
  pendingSignupId!: string;

  @ApiProperty()
  maskedEmail!: string;

  @ApiProperty()
  expiresIn!: string;

  @ApiProperty()
  resendAfter!: string;
}

export class RegisterResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: RegisterPendingDataDto })
  data!: RegisterPendingDataDto;
}