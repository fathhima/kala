import { UserRole } from "@/shared/enums/role.enum";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  password: string | null;
  roles: UserRole[];
  imageUrl?: string | null;
  googleId?: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};