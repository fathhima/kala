import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { USER_REPOSITORY } from './repositories/interfaces/user.interface';
import { UserService } from './services/user.service';
import { USER_SERVICE } from './services/interfaces/user.service.interface';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { USER_IDENTITY_SERVICE } from './services/interfaces/user-identity.service.interface';
import { UserIdentityService } from './services/user-identity.service';
import { ADMIN_USER_SERVICE } from './services/interfaces/admin-user.service.interface';
import { AdminUserService } from './services/admin-user.service';
import { ADMIN_USER_REPOSITORY } from './repositories/interfaces/admin-user.interface';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    {
      provide: USER_SERVICE,
      useClass: UserService,
    },
    {
      provide: USER_IDENTITY_SERVICE,
      useClass: UserIdentityService
    },
    {
      provide: ADMIN_USER_SERVICE,
      useClass: AdminUserService
    },
    PrismaUserRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: PrismaUserRepository
    },
    {
      provide: ADMIN_USER_REPOSITORY,
      useExisting: PrismaUserRepository
    }
  ],
  exports: [USER_SERVICE, USER_IDENTITY_SERVICE, ADMIN_USER_SERVICE],
})
export class UserModule { }