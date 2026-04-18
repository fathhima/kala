import { Role } from "@prisma/client";

export class UpdateUserDto {

  name?: string;

  password?: string | null;

  imageUrl?: string | null;

  googleId?: string;

  roles?: Role[];

  isVerified?: boolean;
  
}
