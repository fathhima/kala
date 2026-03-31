import { UserRole } from "../entities/user.entity";

export class UpdateUserDto {

  name?: string;

  password?: string | null;

  imageUrl?: string | null;

  googleId?: string;

  roles?: UserRole[];

  isVerified?: boolean;
  
}
