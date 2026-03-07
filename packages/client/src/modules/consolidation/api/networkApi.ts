import apiClient from "@/core/api/axios";
import type { ApiResponse } from "@shared/types/apiResponse";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";
import type {
  NetworkAttributes,
  NetworkCreate,
  NetworkUpdate,
} from "@modules/consolidation/types/network.type";

/**
 * Función que realiza la petición GET al backend para obtener todas las redes.
 * Ruta: GET /ec/api/v1/networks
 * @returns Promesa que resuelve en un array de objetos NetworkAttributes.
 */
export const getAllNetworks = async (): Promise<NetworkAttributes[]> => {
  try {
    const response = await apiClient.get<ApiResponse<NetworkAttributes>>(
      `${API_ROUTES_PATH.CONSOLIDATION}/networks`,
    );
    return response.data.data.map((network) => ({
      ...network,
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición GET al backend para obtener una red.
 * Ruta: GET /ec/api/v1/networks/{id}
 * @param id ID de la red.
 * @returns Promesa que resuelve en un objeto NetworkAttributes.
 */
export const getOneNetwork = async (id: number): Promise<NetworkAttributes> => {
  try {
    const response = await apiClient.get<ApiResponse<NetworkAttributes>>(
      `${API_ROUTES_PATH.CONSOLIDATION}/networks/${id}`,
    );
    return response.data.data[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición POST al backend para crear una red.
 * Ruta: POST /ec/api/v1/networks
 * @param network Objeto NetworkCreate con los datos de la red a crear.
 * @returns Promesa que resuelve en un objeto NetworkAttributes.
 */
export const createNetwork = async (
  network: NetworkCreate,
): Promise<NetworkAttributes> => {
  try {
    const response = await apiClient.post<ApiResponse<NetworkAttributes>>(
      `${API_ROUTES_PATH.CONSOLIDATION}/networks`,
      network,
    );
    return response.data.data[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición PUT al backend para actualizar una red.
 * Ruta: PUT /ec/api/v1/networks/{id}
 * @param id ID de la red a actualizar.
 * @param data Objeto NetworkAttributes con los datos de la red a actualizar.
 * @returns Promesa que resuelve en un objeto NetworkAttributes.
 */
export const updateNetwork = async ({
  id,
  ...data
}: NetworkUpdate): Promise<NetworkAttributes> => {
  try {
    const response = await apiClient.put<ApiResponse<NetworkAttributes>>(
      `${API_ROUTES_PATH.CONSOLIDATION}/networks/${id}`,
      data,
    );
    return response.data.data as unknown as NetworkAttributes;
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición DELETE al backend para eliminar una red.
 * Ruta: DELETE /ec/api/v1/networks/{id}
 * @param id ID de la red a eliminar.
 * @returns Promesa que resuelve en un mensaje.
 */
export const deleteNetwork = async (id: number): Promise<string> => {
  try {
    const response = await apiClient.delete<ApiResponse<NetworkAttributes>>(
      `${API_ROUTES_PATH.CONSOLIDATION}/networks/${id}`,
    );
    return response.data.message?.[0] || "";
  } catch (error) {
    throw error;
  }
};
