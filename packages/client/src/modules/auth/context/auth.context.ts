import { createContext } from "react";
import type { UserType, LoginType } from "@economic-control/shared";

// 1. Exportar el tipo de contexto
export interface AuthContextType {
  user: UserType | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginType) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// 2. Exportar el objeto Contexto
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
