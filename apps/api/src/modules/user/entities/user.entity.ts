import { Role } from "@prisma/client";

export class UserEntity {
  id!: string;
  name!: string;
  email!: string;
  roles!: Role[];
  imageUrl?: string | null;
  googleId?: string | null;
  isVerified!: boolean;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}