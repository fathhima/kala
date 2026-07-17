import { UserRole } from "@/shared/enums/role.enum";

export type CreateUserInput = {
    name: string;
    email: string;
    password: string | null;
    imageUrl?: string | null
    googleId?: string | null;
    roles?: UserRole[]
    isVerified?: boolean
    isActive?: boolean
}