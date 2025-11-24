import type { UserCreationRequest } from "@economic-control/shared";
import type { LoginRequest } from "@economic-control/shared";

export interface User extends Omit<UserCreationRequest, "password"> {
  id: number;
}

export type LoginCredentials = LoginRequest;

/*export interface User {
  id?: number;
  role: "ADMINISTRADOR" | "SUPER_USER";
  username: string;
  first_name: string;
  last_name: string;
  isVisible?: boolean;
}*/

/*export interface LoginCredentials {
  login_data: string;
  password: string;
}*/

export interface LoginResponse {
  ok: boolean;
  message: string;
  token: string;
  user?: User;
}
