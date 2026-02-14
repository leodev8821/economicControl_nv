import axios from "axios";
import apiClient from "@core/api/axios";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";
import type {
  LoginCredentials,
  LoginResponse,
} from "@modules/auth/types/user.type";

/**
 * Función que realiza la petición POST al backend para autenticar al usuario.
 * @param credentials - login_data (username) y password del usuario.
 * @returns Promesa que resuelve en un objeto LoginResponse (token y message).
 */
export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  try {
    // POST /ec/api/v1/auth/login
    const response = await apiClient.post<LoginResponse>(
      `${API_ROUTES_PATH.AUTH}/login`,
      credentials,
    );

    return {
      ...response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage = error.response.data.message;
      throw new Error(
        backendMessage || "Credenciales inválidas o error desconocido.",
      );
    }
    throw new Error("Error de conexión con el servidor.");
  }
};
