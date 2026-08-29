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

export type RegisterResult = {
  pendingSignupId: string;
  maskedEmail: string;
  expiresIn: number;
  resendAfter: number;
};

export type ResendOtpResult = {
  expiresIn: number;
  resendAfter: number;
};

export type ValidateResetTokenResult = {
  valid: boolean;
};