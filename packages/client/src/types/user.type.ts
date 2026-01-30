import type { UserCreationRequest } from "@economic-control/shared";
import type { LoginType } from "@economic-control/shared";

export interface User extends Omit<UserCreationRequest, "password"> {
  id: number;
}

export type UserAttributes = User;

export type LoginCredentials = LoginType;

/*export interface User {
  id?: number;
  role_name: "ADMINISTRADOR" | "SUPER_USER";
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  is_visible?: boolean;
}*/

export interface LoginResponse {
  ok: boolean;
  message: string;
  token: string;
  user?: User;
}
