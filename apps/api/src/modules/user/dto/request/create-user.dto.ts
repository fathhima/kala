import { UserRole } from "@/shared/enums/role.enum";

export class CreateUserDto {
    name!: string;

    email!: string;

    password!: string

    roles!: UserRole[] 

}