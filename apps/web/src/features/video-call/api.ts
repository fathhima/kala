import {
  VideoCallApi,
  Configuration,
  type VideoSessionAccessDto,
  type IceServerConfigDto,
} from '@/api';
import { apiClient } from '@/lib/axios';

const configuration = new Configuration({
  basePath: import.meta.env.VITE_API_URL,
});

const videoCallApi = new VideoCallApi(configuration, undefined, apiClient);

export const getVideoSessionAccess = async (
  bookingId: string,
): Promise<VideoSessionAccessDto> => {
  const response = await videoCallApi.videoCallControllerGetSessionAccess(bookingId);
  return ((response.data as unknown as { data?: VideoSessionAccessDto })?.data ??
    response.data) as VideoSessionAccessDto;
};

export const getVideoIceServers = async (): Promise<IceServerConfigDto[]> => {
  const response = await videoCallApi.videoCallControllerGetIceServers();
  return ((response.data as unknown as { data?: IceServerConfigDto[] })?.data ??
    response.data) as IceServerConfigDto[];
};
