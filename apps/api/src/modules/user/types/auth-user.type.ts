import { Role } from "@prisma/client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  password: string | null;
  roles: Role[];
  imageUrl: string | null;
  googleId: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};