//import type { UserCreationRequest } from "@economic-control/shared";
import type { LoginType } from "@economic-control/shared";
import type { UserPermissionType } from "@economic-control/shared";

export interface User {
  id: number;
  username: string;
  role_name: "Administrador" | "SuperUser" | "Líder" | "Miembro";
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  permissions: UserPermissionType[];
  is_visible: boolean;
}

export type UserAttributes = User;

export type LoginCredentials = LoginType;

export interface LoginResponse {
  ok: boolean;
  token: string;
  user: User;
  message?: string;
}
