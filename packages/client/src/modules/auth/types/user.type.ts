import type { UserCreationRequest } from "@economic-control/shared";
import type { LoginType } from "@economic-control/shared";

export interface User extends Omit<UserCreationRequest, "password"> {
  id: number;
}

export type UserAttributes = User;

export type LoginCredentials = LoginType;

export interface LoginResponse {
  ok: boolean;
  message: string;
  token: string;
  user?: User;
}
