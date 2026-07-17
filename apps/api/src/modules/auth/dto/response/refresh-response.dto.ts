import { ApiProperty } from "@nestjs/swagger";

export class RefreshDataDto {
  @ApiProperty()
  accessToken!: string;
}

export class RefreshResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: RefreshDataDto })
  data!: RefreshDataDto;

  static fromResult(params: {
    message: string;
    accessToken: string;
  }): RefreshResponseDto {
    const dto = new RefreshResponseDto();

    dto.success = true;
    dto.message = params.message;
    dto.data = {
      accessToken: params.accessToken,
    };

    return dto;
  }
}