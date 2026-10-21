import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IceServerConfigDto {
  @ApiProperty({
    description: 'STUN or TURN URLs',
    example: ['stun:stun.l.google.com:19302'],
  })
  urls!: string | string[];

  @ApiPropertyOptional({
    description: 'Username for TURN authentication (if applicable)',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Credential/Password for TURN authentication (if applicable)',
  })
  credential?: string;
}
