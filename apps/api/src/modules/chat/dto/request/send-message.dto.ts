import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { MessageType } from '../../enums/message-type.enum';

export class SendMessageDto {
  @ApiProperty({ description: 'The text content of the message', example: 'Hello, what materials do I need for our session?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;

  @ApiPropertyOptional({ enum: MessageType, default: MessageType.TEXT })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType = MessageType.TEXT;

  @ApiPropertyOptional({ description: 'Optional client generated tempId for optimistic delivery matching' })
  @IsOptional()
  @IsString()
  tempId?: string;
}
