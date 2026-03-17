import { UserRole } from "../entities/user.entity";

export class UpdateUserDto {

  name?: string;

  password?: string;

  imageUrl?: string;

  roles?: UserRole[];

  isVerified?: boolean;
  
}
