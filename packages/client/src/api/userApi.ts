/* eslint-disable no-useless-catch */
import apiClient from "./axios";
import type { User, UserAttributes } from "../types/user.type";
import type { ApiResponse, ApiResponseData } from "../types/apiResponse";
import type { UserCreationRequest } from "@economic-control/shared";

/**
 * Función que realiza la petición GET al backend para obtener todos los usuarios.
 * Ruta: GET /ec/api/v1/users
 * @returns Promesa que resuelve en un array de objetos User.
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    // Usamos la ruta relativa, el proxy de Vite y el prefijo de Axios hacen el resto.
    const response = await apiClient.get<ApiResponse<User>>("/users");

    // Devolvemos el array limpio y tipado correctamente
    return response.data.data.map((user) => ({
      ...user,
    }));
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
    throw error;
  }
};

export const createUser = async (user: UserCreationRequest): Promise<User> => {
  try {
    const response = await apiClient.post<ApiResponseData<User>>(
      "/users",
      user,
    );
    return response.data.data as unknown as User;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async ({
  id,
  ...data
}: UserAttributes): Promise<User> => {
  try {
    const response = await apiClient.put<ApiResponseData<User>>(
      `/users/${id}`,
      data,
    );
    return response.data.data as unknown as User;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/users/${id}`);
  } catch (error) {
    throw error;
  }
};
