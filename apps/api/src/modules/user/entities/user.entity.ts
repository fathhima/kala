import { UserRole } from "@/shared/enums/role.enum";

export class UserEntity {
  id!: string;
  name!: string;
  email!: string;
  password!: string | null;
  roles!: UserRole[];
  imageUrl?: string | null;
  googleId?: string | null;
  isVerified!: boolean;
  hasPassword!: boolean
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}