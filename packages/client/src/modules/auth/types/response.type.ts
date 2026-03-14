import type { UserType } from "@economic-control/shared";
export interface LoginResponse {
  ok: boolean;
  token: string;
  user: UserType;
  message?: string;
}
