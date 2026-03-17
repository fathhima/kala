import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './services/user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/response/user.response.dto';
import { MessageOnlyResponse } from '@/shared/dto/common/message-only-response.dto';
import { UpdateUserStatusDto } from './dto/request/update-user-status.request.dto';
import { MessageOnlyHttpResponse } from '@/shared/types';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    @Inject('UserService')
    private readonly userService: UserService) { }

  @Get()
  @ApiOperation({ summary: 'List all users with pagination and filtering' })
  @ApiOkResponse({ type: UserResponseDto, isArray: true, description: 'Paginated list of users' })
  async findAll(@Query() query: UserQueryDto): Promise<UserResponseDto[]> {
    const { data } = await this.userService.findAll(query)
    return data
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User CUID' })
  @ApiOkResponse({ type: UserResponseDto, description: 'User found' })
  @ApiNotFoundResponse({ description: 'User not found' })
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user profile' })
  @ApiParam({ name: 'id', description: 'User CUID' })
  @ApiOkResponse({ type: UserResponseDto, description: 'Updated user' })
  @ApiNotFoundResponse({ description: 'User not found' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update a user status' })
  @ApiParam({ name: 'id', description: 'User CUID' })
  @ApiOkResponse({ type: MessageOnlyHttpResponse, description: 'Updated user' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto): Promise<MessageOnlyHttpResponse> {
    await this.userService.updateStatus(id, dto);
    return { message: 'User status updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User CUID' })
  @ApiNoContentResponse({ description: 'User deleted' })
  @ApiNotFoundResponse({ description: 'User not found' })
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}