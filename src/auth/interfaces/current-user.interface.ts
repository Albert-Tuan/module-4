import { Role } from '../enums/role.enum';

export interface CurrentUser {
  userId: string;
  email: string;
  role: Role;
}
