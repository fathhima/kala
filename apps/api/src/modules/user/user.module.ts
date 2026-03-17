import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { USER_REPOSITORY } from './repositories/interfaces/user.repository';

@Module({
  controllers: [UserController],
  providers: [
    { provide: 'UserService', useClass: UserService },
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: ['UserService'],
})
export class UserModule { }
