import { ApiProperty } from "@nestjs/swagger";

export class MessageResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;

  static success(message: string): MessageResponseDto {
    const dto = new MessageResponseDto();
    dto.success = true;
    dto.message = message;
    return dto;
  }
}