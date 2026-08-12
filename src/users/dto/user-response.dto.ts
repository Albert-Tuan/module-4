import { User, Role } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;

  constructor(partial: Partial<User>) {
    this.id = partial.id;
    this.email = partial.email;
    this.name = partial.name;
    this.role = partial.role;
    this.avatar = partial.avatar;
    this.createdAt = partial.createdAt;
    this.updatedAt = partial.updatedAt;
    this.deletedAt = partial.deletedAt;
  }
}
