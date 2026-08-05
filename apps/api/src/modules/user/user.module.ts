import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { USER_REPOSITORY } from './repositories/interfaces/user.repository';
import { UserService } from './user.service';
import { ADMIN_USER_REPOSITORY } from '../admin/repositories/interfaces/admin-user.repository';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    PrismaUserRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: PrismaUserRepository
    },
    {
      provide: ADMIN_USER_REPOSITORY,
      useExisting: PrismaUserRepository
    },

  ],
  exports: [USER_REPOSITORY, ADMIN_USER_REPOSITORY],
})
export class UserModule { }