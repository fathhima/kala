import { BookingStatus } from '@/modules/booking/enums/booking.enum';

export const VIDEO_CALL_REPOSITORY = Symbol('VIDEO_CALL_REPOSITORY');

export interface VideoSessionBookingDetails {
  id: string;
  status: BookingStatus;
  offeringTitle: string;
  slot: {
    startTime: Date;
    endTime: Date;
    timezone: string;
  };
  student: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  instructor: {
    userId: string;
    name: string;
    imageUrl: string | null;
  };
}

export interface IVideoCallRepository {
  findBookingForSession(bookingId: string): Promise<VideoSessionBookingDetails | null>;
}
