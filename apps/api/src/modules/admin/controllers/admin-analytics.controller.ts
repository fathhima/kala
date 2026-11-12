import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserRole } from '@/shared/enums/role.enum';
import { AdminAnalyticsQueryDto } from '../dto/admin-analytics-query.dto';
import { AdminAnalyticsResponseDto } from '../dto/admin-analytics-response.dto';
import { AdminAnalyticsService } from '../services/admin-analytics.service';

@ApiTags('Admin analytics')
@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  @Get('analytics')
  @ApiOperation({
    summary: 'Get platform-wide admin analytics and dashboard metrics',
  })
  @ApiOkResponse({ type: AdminAnalyticsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Access token is missing or invalid' })
  @ApiForbiddenResponse({ description: 'Only admins can access this resource' })
  async getAnalytics(@Query() query: AdminAnalyticsQueryDto): Promise<AdminAnalyticsResponseDto> {
    const data = await this.analyticsService.getAnalytics(query.range ?? '30d');
    return {
      message: 'Admin analytics fetched successfully',
      data,
    };
  }
}
