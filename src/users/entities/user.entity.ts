export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export class User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: Role;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
