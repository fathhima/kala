import { VideoSessionAccessDto } from '../../dto/response/video-session-access.dto';
import { IceServerConfigDto } from '../../dto/response/ice-server-config.dto';

export const VIDEO_CALL_SERVICE = Symbol('VIDEO_CALL_SERVICE');

export interface IVideoCallService {
  validateSessionAccess(
    userId: string,
    bookingId: string,
  ): Promise<VideoSessionAccessDto>;

  getIceServers(): IceServerConfigDto[];
}
