import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { USER_REPOSITORY } from './repositories/interfaces/user.repository';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository
    }

  ],
  exports: [USER_REPOSITORY],
})
export class UserModule { }