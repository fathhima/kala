import { Prisma } from '@prisma/client';
import {
  ChatMessageEntity,
  ChatSenderEntity,
  PaginatedChatMessageEntity,
} from '../entities/chat-message.entity';
import {
  ChatParticipantEntity,
  ChatRoomEntity,
} from '../entities/chat-room.entity';
import { MessageType } from '../enums/message-type.enum';

export const chatMessageInclude = Prisma.validator<Prisma.ChatMessageInclude>()({
  sender: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  },
});

export type ChatMessageRecord = Prisma.ChatMessageGetPayload<{
  include: typeof chatMessageInclude;
}>;

export const chatRoomInclude = Prisma.validator<Prisma.ChatRoomInclude>()({
  booking: {
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
        },
      },
    },
  },
  messages: {
    include: chatMessageInclude,
    orderBy: { createdAt: 'desc' },
    take: 1,
  },
});

export type ChatRoomRecord = Prisma.ChatRoomGetPayload<{
  include: typeof chatRoomInclude;
}>;

export class ChatMapper {
  static toMessageEntity(record: ChatMessageRecord): ChatMessageEntity {
    const sender: ChatSenderEntity = {
      id: record.sender.id,
      name: record.sender.name,
      imageUrl: record.sender.imageUrl,
    };

    const entity = new ChatMessageEntity();
    entity.id = record.id;
    entity.roomId = record.roomId;
    entity.senderId = record.senderId;
    entity.content = record.content;
    entity.type = record.type as MessageType;
    entity.isRead = record.isRead;
    entity.readAt = record.readAt;
    entity.createdAt = record.createdAt;
    entity.sender = sender;

    return entity;
  }

  static toRoomEntity(record: ChatRoomRecord): ChatRoomEntity {
    const student: ChatParticipantEntity = {
      userId: record.booking.student.id,
      name: record.booking.student.name,
      imageUrl: record.booking.student.imageUrl,
      role: 'STUDENT',
    };

    const instructor: ChatParticipantEntity = {
      userId: record.booking.profile.user.id,
      name: record.booking.profile.user.name,
      imageUrl: record.booking.profile.user.imageUrl,
      role: 'INSTRUCTOR',
    };

    const lastMessage =
      record.messages.length > 0
        ? ChatMapper.toMessageEntity(record.messages[0])
        : null;

    const entity = new ChatRoomEntity();
    entity.id = record.id;
    entity.bookingId = record.bookingId;
    entity.lastMessageAt = record.lastMessageAt;
    entity.createdAt = record.createdAt;
    entity.updatedAt = record.updatedAt;
    entity.bookingStatus = record.booking.status;
    entity.slotStartTime = record.booking.slot.startTime;
    entity.slotEndTime = record.booking.slot.endTime;
    entity.student = student;
    entity.instructor = instructor;
    entity.lastMessage = lastMessage;

    return entity;
  }

  static toPaginatedMessages(
    records: ChatMessageRecord[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedChatMessageEntity {
    // Reverse so chronological order (oldest -> newest) for chat rendering
    const items = [...records].reverse().map(ChatMapper.toMessageEntity);

    const entity = new PaginatedChatMessageEntity();
    entity.items = items;
    entity.total = total;
    entity.page = page;
    entity.limit = limit;

    return entity;
  }
}
