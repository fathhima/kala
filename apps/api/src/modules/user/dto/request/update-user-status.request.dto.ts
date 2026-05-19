import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({
    example: false,
    description: 'Set false to block the user, true to unblock the user',
  })
  @IsBoolean()
  isActive!: boolean;
}