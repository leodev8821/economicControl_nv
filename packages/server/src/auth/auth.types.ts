import { UserRole } from "../models/user.model.js";

export interface JwtPayload {
  id: number;
  username: string;
  role_name: UserRole;
  first_name: string;
  last_name: string;
}
