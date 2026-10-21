import {
  Controller,
  Get,
  Inject,
  Param,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserId } from '@/shared/decorators/user-id.decorator';
import {
  VIDEO_CALL_SERVICE,
  type IVideoCallService,
} from './services/interfaces/video-call.service.interface';
import { VideoSessionAccessDto } from './dto/response/video-session-access.dto';
import { IceServerConfigDto } from './dto/response/ice-server-config.dto';

@ApiTags('Video Call')
@Controller('video-call')
export class VideoCallController {
  constructor(
    @Inject(VIDEO_CALL_SERVICE)
    private readonly _videoCallService: IVideoCallService,
  ) {}

  @Get('sessions/:bookingId/access')
  @ApiOperation({
    summary: 'Check session eligibility, timing windows, partner details, and ICE config',
  })
  @ApiOkResponse({ type: VideoSessionAccessDto })
  async getSessionAccess(
    @UserId() userId: string,
    @Param('bookingId') bookingId: string,
  ): Promise<VideoSessionAccessDto> {
    return this._videoCallService.validateSessionAccess(userId, bookingId);
  }

  @Get('ice-servers')
  @ApiOperation({ summary: 'Get current STUN/TURN ICE server configuration' })
  @ApiOkResponse({ type: [IceServerConfigDto] })
  async getIceServers(): Promise<IceServerConfigDto[]> {
    return this._videoCallService.getIceServers();
  }
}
