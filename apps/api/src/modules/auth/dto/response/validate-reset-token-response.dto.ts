import { ApiProperty } from "@nestjs/swagger";

export class ValidateResetTokenDataDto {
  @ApiProperty()
  valid!: boolean;
}

export class ValidateResetTokenResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: ValidateResetTokenDataDto })
  data!: ValidateResetTokenDataDto;

  static fromResult(params: {
    message: string;
    valid: boolean;
  }): ValidateResetTokenResponseDto {
    const dto = new ValidateResetTokenResponseDto();

    dto.success = true;
    dto.message = params.message;
    dto.data = {
      valid: params.valid,
    };

    return dto;
  }
}