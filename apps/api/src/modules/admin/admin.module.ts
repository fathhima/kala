import { Module } from '@nestjs/common';
import { UserModule } from '@/modules/user/user.module';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { CategoryModule } from '../category/category.module';
import { InstructorModule } from '../instructor/instructor.module';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { AdminCategoryController } from './controllers/admin-category.controller';
import { AdminInstructorController } from './controllers/admin-instructor.controller';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminAnalyticsService } from './services/admin-analytics.service';

@Module({
  imports: [PrismaModule, UserModule, CategoryModule, InstructorModule],
  controllers: [
    AdminUserController,
    AdminInstructorController,
    AdminCategoryController,
    AdminAnalyticsController,
  ],
  providers: [AdminAnalyticsService],
})
export class AdminModule {}
