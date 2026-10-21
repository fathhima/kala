import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { BasePrismaRepository } from '@/shared/prisma/base';
import { BookingStatus } from '@/modules/booking/enums/booking.enum';
import {
  IVideoCallRepository,
  VideoSessionBookingDetails,
} from './interfaces/video-call.repository.interface';

@Injectable()
export class PrismaVideoCallRepository
  extends BasePrismaRepository
  implements IVideoCallRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findBookingForSession(
    bookingId: string,
  ): Promise<VideoSessionBookingDetails | null> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        profile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        slot: {
          select: {
            startTime: true,
            endTime: true,
            timezone: true,
          },
        },
        offering: {
          include: {
            subcategory: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return null;
    }

    const offeringTitle =
      booking.offering.title ||
      booking.offering.subcategory?.name ||
      'Creative Session';

    return {
      id: booking.id,
      status: booking.status as BookingStatus,
      offeringTitle,
      slot: {
        startTime: booking.slot.startTime,
        endTime: booking.slot.endTime,
        timezone: booking.slot.timezone,
      },
      student: {
        id: booking.student.id,
        name: booking.student.name,
        imageUrl: booking.student.imageUrl,
      },
      instructor: {
        userId: booking.profile.user.id,
        name: booking.profile.user.name,
        imageUrl: booking.profile.user.imageUrl,
      },
    };
  }
}
