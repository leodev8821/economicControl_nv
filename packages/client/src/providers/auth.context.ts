import { createContext } from "react";
import type { User, LoginCredentials } from "../types/user.type";

// 1. Exportar el tipo de contexto
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// 2. Exportar el objeto Contexto
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
