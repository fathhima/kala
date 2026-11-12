import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { BasePrismaRepository } from '@/shared/prisma/base';
import { IChatRepository } from './interfaces/chat.repository.interface';
import {
  ChatMessageEntity,
  PaginatedChatMessageEntity,
} from '../entities/chat-message.entity';
import { ChatRoomEntity } from '../entities/chat-room.entity';
import {
  ChatMapper,
  chatMessageInclude,
  chatRoomInclude,
} from '../mappers/chat.mapper';
import { MessageType } from '../enums/message-type.enum';

@Injectable()
export class PrismaChatRepository
  extends BasePrismaRepository
  implements IChatRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findRoomByBookingId(bookingId: string): Promise<ChatRoomEntity | null> {
    const record = await this.prisma.chatRoom.findUnique({
      where: { bookingId },
      include: chatRoomInclude,
    });

    return record ? ChatMapper.toRoomEntity(record) : null;
  }

  async findRoomById(roomId: string): Promise<ChatRoomEntity | null> {
    const record = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: chatRoomInclude,
    });

    return record ? ChatMapper.toRoomEntity(record) : null;
  }

  async findRoomsForUser(
    userId: string,
    role?: 'STUDENT' | 'INSTRUCTOR',
  ): Promise<ChatRoomEntity[]> {
    const ownershipWhere: Prisma.BookingWhereInput =
      role === 'STUDENT'
        ? { studentId: userId }
        : role === 'INSTRUCTOR'
          ? { profile: { userId } }
          : { OR: [{ studentId: userId }, { profile: { userId } }] };

    const bookingWhere: Prisma.BookingWhereInput = {
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
      ...ownershipWhere,
    };

    const missingRoomBookings = await this.prisma.booking.findMany({
      where: {
        ...bookingWhere,
        chatRoom: { is: null },
      },
      select: { id: true },
    });

    if (missingRoomBookings.length > 0) {
      await this.prisma.chatRoom.createMany({
        data: missingRoomBookings.map((b) => ({ bookingId: b.id })),
        skipDuplicates: true,
      });
    }

    const records = await this.prisma.chatRoom.findMany({
      where: { booking: bookingWhere },
      include: chatRoomInclude,
    });

    return records
      .map(ChatMapper.toRoomEntity)
      .sort((a, b) => {
        const aTime = (a.lastMessageAt ?? a.createdAt).getTime();
        const bTime = (b.lastMessageAt ?? b.createdAt).getTime();
        return bTime - aTime;
      });
  }

  async createRoom(bookingId: string): Promise<ChatRoomEntity> {
    // upsert - if a room already exists for the booking, retrieve it. otherwise, create one.
    const record = await this.prisma.chatRoom.upsert({
      where: { bookingId },
      create: { bookingId },
      update: {},
      include: chatRoomInclude,
    });

    return ChatMapper.toRoomEntity(record);
  }

  async saveMessage(data: {
    roomId: string;
    senderId: string;
    content: string;
    type?: MessageType;
  }): Promise<ChatMessageEntity> {
    const [message] = await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: {
          roomId: data.roomId,
          senderId: data.senderId,
          content: data.content,
          type: data.type ?? MessageType.TEXT,
        },
        include: chatMessageInclude,
      }),
      this.prisma.chatRoom.update({
        where: { id: data.roomId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    return ChatMapper.toMessageEntity(message);
  }

  async getMessages(
    roomId: string,
    query: { page: number; limit: number },
  ): Promise<PaginatedChatMessageEntity> {
    const skip = (query.page - 1) * query.limit;

    const [total, rawItems] = await Promise.all([
      this.prisma.chatMessage.count({
        where: { roomId },
      }),
      this.prisma.chatMessage.findMany({
        where: { roomId },
        include: chatMessageInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
    ]);

    return ChatMapper.toPaginatedMessages(
      rawItems,
      total,
      query.page,
      query.limit,
    );
  }

  async markMessagesAsRead(
    roomId: string,
    recipientUserId: string,
  ): Promise<number> {
    const result = await this.prisma.chatMessage.updateMany({
      where: {
        roomId,
        senderId: { not: recipientUserId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  async getUnreadCount(
    roomId: string,
    recipientUserId: string,
  ): Promise<number> {
    return this.prisma.chatMessage.count({
      where: {
        roomId,
        senderId: { not: recipientUserId },
        isRead: false,
      },
    });
  }

  async getUnreadCountsByRoomIds(
    roomIds: string[],
    recipientUserId: string,
  ): Promise<Record<string, number>> {
    if (roomIds.length === 0) {
      return {};
    }

    const counts = await this.prisma.chatMessage.groupBy({
      by: ['roomId'],
      where: {
        roomId: { in: roomIds },
        senderId: { not: recipientUserId },
        isRead: false,
      },
      _count: { _all: true },
    });

    const result: Record<string, number> = {};
    for (const row of counts) {
      result[row.roomId] = row._count._all;
    }
    return result;
  }

  async bookingExists(bookingId: string): Promise<boolean> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true },
    });

    return Boolean(booking);
  }
}
