import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PeerRole, VideoSessionStatus } from '../../enums/video-call.enum';
import { IceServerConfigDto } from './ice-server-config.dto';

export class VideoPartnerDto {
  @ApiProperty({ example: 'usr_abc123' })
  id!: string;

  @ApiProperty({ example: 'Ananya Sharma' })
  name!: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', nullable: true })
  imageUrl!: string | null;

  @ApiProperty({ enum: PeerRole, example: PeerRole.INSTRUCTOR })
  role!: PeerRole;
}

export class VideoSessionAccessDto {
  @ApiProperty({ example: 'bkg_12345' })
  bookingId!: string;

  @ApiProperty({ example: true })
  canJoin!: boolean;

  @ApiProperty({ enum: VideoSessionStatus, example: VideoSessionStatus.ACTIVE })
  status!: VideoSessionStatus;

  @ApiPropertyOptional({ example: 'The session room opens 10 minutes prior to scheduled start time.' })
  reason?: string;

  @ApiProperty({ example: 'Clay Pottery Masterclass' })
  sessionTitle!: string;

  @ApiProperty({ example: '2026-10-21T15:00:00.000Z' })
  slotStartTime!: Date;

  @ApiProperty({ example: '2026-10-21T16:00:00.000Z' })
  slotEndTime!: Date;

  @ApiProperty({ example: '2026-10-21T14:50:00.000Z' })
  earlyJoinTime!: Date;

  @ApiProperty({ example: '2026-10-21T16:15:00.000Z' })
  overtimeEndTime!: Date;

  @ApiProperty({ example: false })
  isOvertime!: boolean;

  @ApiProperty({ enum: PeerRole, example: PeerRole.STUDENT })
  currentUserRole!: PeerRole;

  @ApiProperty({ type: VideoPartnerDto })
  partner!: VideoPartnerDto;

  @ApiProperty({ type: [IceServerConfigDto] })
  iceServers!: IceServerConfigDto[];
}
