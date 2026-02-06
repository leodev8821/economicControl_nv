/* eslint-disable no-useless-catch */
import apiClient from "@core/api/axios";
import type { User, UserAttributes } from "@modules/auth/types/user.type";
import type { ApiResponse, ApiResponseData } from "@shared/types/apiResponse";
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

/**
 * Función que realiza la petición POST al backend para crear un nuevo usuario.
 * Ruta: POST /ec/api/v1/users
 * @param user - Objeto UserCreationRequest con los datos del usuario a crear.
 * @returns Promesa que resuelve en un objeto User.
 */
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

/**
 * Función que realiza la petición PUT al backend para actualizar un usuario.
 * Ruta: PUT /ec/api/v1/users/{id}
 * @param id - ID del usuario a actualizar.
 * @param data - Objeto UserAttributes con los datos del usuario a actualizar.
 * @returns Promesa que resuelve en un objeto User.
 */
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

/**
 * Función que realiza la petición DELETE al backend para eliminar un usuario.
 * Ruta: DELETE /ec/api/v1/users/{id}
 * @param id - ID del usuario a eliminar.
 * @returns Promesa que resuelve en void.
 */
export const deleteUser = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/users/${id}`);
  } catch (error) {
    throw error;
  }
};
