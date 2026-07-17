import { UserRole } from "@/shared/enums/role.enum";

export class UpdateUserDto {

  name?: string;

  password?: string | null;

  imageUrl?: string | null;

  googleId?: string;

  roles?: UserRole[];

  isVerified?: boolean;
  
}
