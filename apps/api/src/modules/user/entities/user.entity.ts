export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

export type UserRoleType = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'

export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  roles: UserRole[];
  imageUrl: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    roles: UserRole[]
  ) {
    this.id = id
    this.name = name
    this.email = email
    this.password = password
    this.roles = roles

    this.imageUrl = null
    this.isVerified = false
    this.isActive = true
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}