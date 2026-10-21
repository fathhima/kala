import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserId } from '@/shared/decorators/user-id.decorator';
import { CHAT_SERVICE, type IChatService } from './services/interfaces/chat.service.interface';
import {
  ChatMessageResponseDto,
  ChatRoomResponseDto,
  PaginatedChatMessagesResponseDto,
} from './dto/response/chat-response.dto';
import { ChatMessagesQueryDto } from './dto/request/chat-query.dto';
import { SendMessageDto } from './dto/request/send-message.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    @Inject(CHAT_SERVICE)
    private readonly _chatService: IChatService,
  ) {}

  @Get('rooms/:bookingId')
  @ApiOperation({ summary: 'Get or initialize a chat room for a booking' })
  @ApiOkResponse({ type: ChatRoomResponseDto })
  async getRoom(
    @UserId() userId: string,
    @Param('bookingId') bookingId: string,
  ): Promise<ChatRoomResponseDto> {
    return this._chatService.getOrCreateRoom(userId, bookingId);
  }

  @Get('rooms/:bookingId/messages')
  @ApiOperation({ summary: 'Get paginated message history for a booking session' })
  @ApiOkResponse({ type: PaginatedChatMessagesResponseDto })
  async getMessages(
    @UserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Query() query: ChatMessagesQueryDto,
  ): Promise<PaginatedChatMessagesResponseDto> {
    return this._chatService.getRoomMessages(
      userId,
      bookingId,
      query.page,
      query.limit,
    );
  }

  @Post('rooms/:bookingId/messages')
  @ApiOperation({ summary: 'Send a message (REST fallback)' })
  @ApiCreatedResponse({ type: ChatMessageResponseDto })
  async sendMessage(
    @UserId() userId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: SendMessageDto,
  ): Promise<ChatMessageResponseDto> {
    return this._chatService.sendMessage(
      userId,
      bookingId,
      dto.content,
      dto.type,
      dto.tempId,
    );
  }

  @Post('rooms/:bookingId/read')
  @ApiOperation({ summary: 'Mark all unread messages in the room as read' })
  @ApiOkResponse({ description: 'Number of messages marked as read' })
  async markRead(
    @UserId() userId: string,
    @Param('bookingId') bookingId: string,
  ): Promise<{ success: boolean; count: number }> {
    return this._chatService.markAsRead(userId, bookingId);
  }
}
