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
  password: string | null;
  roles: UserRole[];
  imageUrl: string | null;
  googleId: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    email: string,
    password: string | null,
    roles: UserRole[]
  ) {
    this.id = id
    this.name = name
    this.email = email
    this.password = password
    this.roles = roles

    this.imageUrl = null
    this.googleId = null
    this.isVerified = false
    this.isActive = true
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}