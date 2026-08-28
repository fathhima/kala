import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { USER_REPOSITORY } from './repositories/interfaces/user.interface';
import { UserService } from './services/user.service';
import { ADMIN_USER_REPOSITORY } from './repositories/interfaces/admin-user.interface';
import { USER_SERVICE } from './services/interfaces/user.service.interface';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: USER_SERVICE,
      useClass: UserService,
    },
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