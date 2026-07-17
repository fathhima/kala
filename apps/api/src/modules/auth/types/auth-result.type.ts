import { UserEntity } from '@/modules/user/entities/user.entity';

export type AuthResult = {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
};

export type RefreshResult = {
  accessToken: string;
  refreshToken: string;
};