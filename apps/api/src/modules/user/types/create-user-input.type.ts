import { Role } from "@prisma/client";

export type CreateUserInput = {
    name: string;
    email: string;
    password: string | null;
    imageUrl?: string | null
    googleId?: string | null;
    roles?: Role[]
    isVerified?: boolean
    isActive?: boolean
}