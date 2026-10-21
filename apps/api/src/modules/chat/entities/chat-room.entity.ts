import { ChatMessageEntity } from './chat-message.entity';

export class ChatParticipantEntity {
  userId!: string;
  name!: string;
  imageUrl!: string | null;
  role!: 'STUDENT' | 'INSTRUCTOR';
}

export class ChatRoomEntity {
  id!: string;
  bookingId!: string;
  lastMessageAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
  bookingStatus!: string;
  slotStartTime!: Date;
  slotEndTime!: Date;
  student!: ChatParticipantEntity;
  instructor!: ChatParticipantEntity;
  lastMessage?: ChatMessageEntity | null;
}
