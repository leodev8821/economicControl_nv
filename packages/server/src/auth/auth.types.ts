import { UserRole } from "../models/auth/user.model.js";

export interface JwtPayload {
  id: number;
  username: string;
  role_name: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  permissions: {
    application_id: number;
    role_id: number;
  }[];
}
