import { ApiProperty } from "@nestjs/swagger";

export class RegisterPendingDataDto {
  @ApiProperty()
  pendingSignupId!: string;

  @ApiProperty()
  maskedEmail!: string;

  @ApiProperty()
  expiresIn!: number;

  @ApiProperty()
  resendAfter!: number;
}

export class RegisterResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: RegisterPendingDataDto })
  data!: RegisterPendingDataDto;

  static fromResult(params: {
    message: string
    pendingSignupId: string;
    maskedEmail: string;
    expiresIn: number;
    resendAfter: number;
  }): RegisterResponseDto {
    const dto = new RegisterResponseDto();

    dto.success = true;
    dto.message = params.message
    dto.data = {
      pendingSignupId: params.pendingSignupId,
      maskedEmail: params.maskedEmail,
      expiresIn: params.expiresIn,
      resendAfter: params.resendAfter,
    };

    return dto;
  }
}