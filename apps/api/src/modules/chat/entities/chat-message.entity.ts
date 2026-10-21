import { MessageType } from '../enums/message-type.enum';

export class ChatSenderEntity {
  id!: string;
  name!: string;
  imageUrl!: string | null;
}

export class ChatMessageEntity {
  id!: string;
  roomId!: string;
  senderId!: string;
  content!: string;
  type!: MessageType;
  isRead!: boolean;
  readAt!: Date | null;
  createdAt!: Date;
  sender!: ChatSenderEntity;
}

export class PaginatedChatMessageEntity {
  items!: ChatMessageEntity[];
  total!: number;
  page!: number;
  limit!: number;
}
