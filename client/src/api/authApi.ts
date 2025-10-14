import axios from 'axios';
import apiClient from './axios';
import type { LoginCredentials, LoginResponse } from '../types/user';

/**
 * Función que realiza la petición POST al backend para autenticar al usuario.
 * @param credentials - login_data (username) y password del usuario.
 * @returns Promesa que resuelve en un objeto LoginResponse (token y message).
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    // POST /ec/api/v1/auth/login
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    // 1. Eliminar el prefijo "Bearer " que devuelve el backend
    let tokenValue = response.data.token;
    if (tokenValue.startsWith("Bearer ")) {
        tokenValue = tokenValue.substring(7); // Elimina los primeros 7 caracteres ("Bearer ")
    }

    return { 
        ...response.data, 
        token: tokenValue // El token ahora es solo el valor JWT
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Manejar 401/403: Mensaje de error personalizado del backend
      const backendMessage = error.response.data.message;
      throw new Error(backendMessage || 'Credenciales inválidas o error desconocido.');
    }
    throw new Error('Error de conexión con el servidor.');
  }
};