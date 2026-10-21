import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ChatMessageEntity,
  PaginatedChatMessageEntity,
} from '../../entities/chat-message.entity';
import {
  ChatParticipantEntity,
  ChatRoomEntity,
} from '../../entities/chat-room.entity';
import { MessageType } from '../../enums/message-type.enum';

export class ChatSenderDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  imageUrl!: string | null;
}

export class ChatMessageDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  roomId!: string;

  @ApiProperty()
  senderId!: string;

  @ApiProperty()
  content!: string;

  @ApiProperty({ enum: MessageType })
  type!: MessageType;

  @ApiProperty()
  isRead!: boolean;

  @ApiPropertyOptional({ nullable: true })
  readAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ type: ChatSenderDto })
  sender!: ChatSenderDto;

  @ApiPropertyOptional({ nullable: true })
  tempId?: string;

  static fromEntity(entity: ChatMessageEntity, tempId?: string): ChatMessageDto {
    const dto = new ChatMessageDto();
    dto.id = entity.id;
    dto.roomId = entity.roomId;
    dto.senderId = entity.senderId;
    dto.content = entity.content;
    dto.type = entity.type;
    dto.isRead = entity.isRead;
    dto.readAt = entity.readAt ? entity.readAt.toISOString() : null;
    dto.createdAt = entity.createdAt.toISOString();
    dto.sender = { ...entity.sender };
    if (tempId) {
      dto.tempId = tempId;
    }
    return dto;
  }
}

export class ChatParticipantDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  imageUrl!: string | null;

  @ApiProperty({ enum: ['STUDENT', 'INSTRUCTOR'] })
  role!: 'STUDENT' | 'INSTRUCTOR';
}

export class ChatRoomDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  bookingId!: string;

  @ApiPropertyOptional({ nullable: true })
  lastMessageAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ description: 'Indicates if current user can post new messages based on booking status and grace window' })
  canWrite!: boolean;

  @ApiPropertyOptional({ description: 'Reason why chat is read-only if canWrite is false' })
  readOnlyReason?: string;

  @ApiProperty()
  bookingStatus!: string;

  @ApiProperty()
  slotStartTime!: string;

  @ApiProperty()
  slotEndTime!: string;

  @ApiProperty({ type: ChatParticipantDto })
  student!: ChatParticipantDto;

  @ApiProperty({ type: ChatParticipantDto })
  instructor!: ChatParticipantDto;

  @ApiPropertyOptional({ type: ChatMessageDto, nullable: true })
  lastMessage?: ChatMessageDto | null;

  @ApiProperty({ default: 0 })
  unreadCount!: number;

  static fromEntity(
    entity: ChatRoomEntity,
    access: { canWrite: boolean; readOnlyReason?: string; unreadCount?: number },
  ): ChatRoomDto {
    const dto = new ChatRoomDto();
    dto.id = entity.id;
    dto.bookingId = entity.bookingId;
    dto.lastMessageAt = entity.lastMessageAt ? entity.lastMessageAt.toISOString() : null;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    dto.canWrite = access.canWrite;
    dto.readOnlyReason = access.readOnlyReason;
    dto.bookingStatus = entity.bookingStatus;
    dto.slotStartTime = entity.slotStartTime.toISOString();
    dto.slotEndTime = entity.slotEndTime.toISOString();
    dto.student = { ...entity.student };
    dto.instructor = { ...entity.instructor };
    dto.lastMessage = entity.lastMessage ? ChatMessageDto.fromEntity(entity.lastMessage) : null;
    dto.unreadCount = access.unreadCount ?? 0;
    return dto;
  }
}

export class ChatRoomResponseDto {
  @ApiProperty()
  message!: string;

  @ApiProperty({ type: ChatRoomDto })
  data!: ChatRoomDto;

  static fromEntity(
    message: string,
    entity: ChatRoomEntity,
    access: { canWrite: boolean; readOnlyReason?: string; unreadCount?: number },
  ): ChatRoomResponseDto {
    const dto = new ChatRoomResponseDto();
    dto.message = message;
    dto.data = ChatRoomDto.fromEntity(entity, access);
    return dto;
  }
}

export class ChatMessageResponseDto {
  @ApiProperty()
  message!: string;

  @ApiProperty({ type: ChatMessageDto })
  data!: ChatMessageDto;

  static fromEntity(message: string, entity: ChatMessageEntity, tempId?: string): ChatMessageResponseDto {
    const dto = new ChatMessageResponseDto();
    dto.message = message;
    dto.data = ChatMessageDto.fromEntity(entity, tempId);
    return dto;
  }
}

export class ChatMessagesPaginationMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}

export class PaginatedChatMessagesDataDto {
  @ApiProperty({ type: [ChatMessageDto] })
  items!: ChatMessageDto[];

  @ApiProperty({ type: ChatMessagesPaginationMetaDto })
  meta!: ChatMessagesPaginationMetaDto;
}

export class PaginatedChatMessagesResponseDto {
  @ApiProperty()
  message!: string;

  @ApiProperty({ type: PaginatedChatMessagesDataDto })
  data!: PaginatedChatMessagesDataDto;

  static fromEntity(message: string, entity: PaginatedChatMessageEntity): PaginatedChatMessagesResponseDto {
    const dto = new PaginatedChatMessagesResponseDto();
    dto.message = message;
    dto.data = {
      items: entity.items.map((item) => ChatMessageDto.fromEntity(item)),
      meta: {
        page: entity.page,
        limit: entity.limit,
        total: entity.total,
        totalPages: Math.ceil(entity.total / entity.limit) || 0,
      },
    };
    return dto;
  }
}
