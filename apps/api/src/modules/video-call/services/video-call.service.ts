import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IVideoCallService,
} from './interfaces/video-call.service.interface';
import {
  type IVideoCallRepository,
  VIDEO_CALL_REPOSITORY,
} from '../repositories/interfaces/video-call.repository.interface';
import { VideoSessionAccessDto } from '../dto/response/video-session-access.dto';
import { IceServerConfigDto } from '../dto/response/ice-server-config.dto';
import { PeerRole, VideoSessionStatus } from '../enums/video-call.enum';
import { BookingStatus } from '@/modules/booking/enums/booking.enum';

const EARLY_JOIN_BUFFER_MS = 10 * 60 * 1000; // 10 minutes before start
const OVERTIME_BUFFER_MS = 15 * 60 * 1000;   // 15 minutes after end

@Injectable()
export class VideoCallService implements IVideoCallService {
  constructor(
    @Inject(VIDEO_CALL_REPOSITORY)
    private readonly _videoCallRepo: IVideoCallRepository,
    private readonly _configService: ConfigService,
  ) {}

  async validateSessionAccess(
    userId: string,
    bookingId: string,
  ): Promise<VideoSessionAccessDto> {
    const booking = await this._videoCallRepo.findBookingForSession(bookingId);

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    const isStudent = booking.student.id === userId;
    const isInstructor = booking.instructor.userId === userId;

    if (!isStudent && !isInstructor) {
      throw new ForbiddenException(
        'You are not authorized to access this video session.',
      );
    }

    const currentUserRole = isStudent ? PeerRole.STUDENT : PeerRole.INSTRUCTOR;
    const partner = isStudent
      ? {
          id: booking.instructor.userId,
          name: booking.instructor.name,
          imageUrl: booking.instructor.imageUrl,
          role: PeerRole.INSTRUCTOR,
        }
      : {
          id: booking.student.id,
          name: booking.student.name,
          imageUrl: booking.student.imageUrl,
          role: PeerRole.STUDENT,
        };

    const iceServers = this.getIceServers();
    const now = Date.now();
    const startTime = new Date(booking.slot.startTime);
    const endTime = new Date(booking.slot.endTime);

    const startMs = startTime.getTime();
    const endMs = endTime.getTime();
    const earlyJoinTime = new Date(startMs - EARLY_JOIN_BUFFER_MS);
    const overtimeEndTime = new Date(endMs + OVERTIME_BUFFER_MS);

    // Non-confirmed statuses
    if (booking.status === BookingStatus.PAYMENT_PENDING) {
      return {
        bookingId: booking.id,
        canJoin: false,
        status: VideoSessionStatus.NOT_READY,
        reason: 'Payment is pending. The session unlocks once payment is confirmed.',
        sessionTitle: booking.offeringTitle,
        slotStartTime: startTime,
        slotEndTime: endTime,
        earlyJoinTime,
        overtimeEndTime,
        isOvertime: false,
        currentUserRole,
        partner,
        iceServers,
      };
    }

    if ([BookingStatus.CANCELLED, BookingStatus.EXPIRED].includes(booking.status)) {
      return {
        bookingId: booking.id,
        canJoin: false,
        status: VideoSessionStatus.CANCELLED,
        reason: 'This session has been cancelled or expired.',
        sessionTitle: booking.offeringTitle,
        slotStartTime: startTime,
        slotEndTime: endTime,
        earlyJoinTime,
        overtimeEndTime,
        isOvertime: false,
        currentUserRole,
        partner,
        iceServers,
      };
    }

    if (booking.status === BookingStatus.COMPLETED) {
      return {
        bookingId: booking.id,
        canJoin: false,
        status: VideoSessionStatus.COMPLETED,
        reason: 'This session has already ended and been marked as completed.',
        sessionTitle: booking.offeringTitle,
        slotStartTime: startTime,
        slotEndTime: endTime,
        earlyJoinTime,
        overtimeEndTime,
        isOvertime: false,
        currentUserRole,
        partner,
        iceServers,
      };
    }

    // Time-based evaluation for CONFIRMED bookings
    if (now < earlyJoinTime.getTime()) {
      return {
        bookingId: booking.id,
        canJoin: false,
        status: VideoSessionStatus.UPCOMING,
        reason: 'The video call room will open 10 minutes prior to scheduled start time.',
        sessionTitle: booking.offeringTitle,
        slotStartTime: startTime,
        slotEndTime: endTime,
        earlyJoinTime,
        overtimeEndTime,
        isOvertime: false,
        currentUserRole,
        partner,
        iceServers,
      };
    }

    if (now > overtimeEndTime.getTime()) {
      return {
        bookingId: booking.id,
        canJoin: false,
        status: VideoSessionStatus.EXPIRED,
        reason: 'The session scheduled time and overtime wrap-up window have expired.',
        sessionTitle: booking.offeringTitle,
        slotStartTime: startTime,
        slotEndTime: endTime,
        earlyJoinTime,
        overtimeEndTime,
        isOvertime: false,
        currentUserRole,
        partner,
        iceServers,
      };
    }

    const isOvertime = now > endMs;

    return {
      bookingId: booking.id,
      canJoin: true,
      status: isOvertime
        ? VideoSessionStatus.OVERTIME
        : VideoSessionStatus.ACTIVE,
      reason: isOvertime
        ? 'Scheduled session time has ended. The 15-minute wrap-up grace period is currently active.'
        : undefined,
      sessionTitle: booking.offeringTitle,
      slotStartTime: startTime,
      slotEndTime: endTime,
      earlyJoinTime,
      overtimeEndTime,
      isOvertime,
      currentUserRole,
      partner,
      iceServers,
    };
  }

  getIceServers(): IceServerConfigDto[] {
    const defaultServers: IceServerConfigDto[] = [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ];

    const turnUrl = this._configService.get<string>('TURN_SERVER_URL');
    const turnUsername = this._configService.get<string>('TURN_USERNAME');
    const turnCredential = this._configService.get<string>('TURN_CREDENTIAL');

    if (turnUrl && turnUsername && turnCredential) {
      defaultServers.push({
        urls: turnUrl,
        username: turnUsername,
        credential: turnCredential,
      });
    }

    return defaultServers;
  }
}
