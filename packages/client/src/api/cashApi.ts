/* eslint-disable no-useless-catch */
import apiClient from "./axios";
import type { Cash } from "../types/cash.type";
import type { ApiResponse, ApiResponseData } from "../types/apiResponse";

/**
 * Función que realiza la petición GET al backend para obtener todos las cajas.
 * Ruta: GET /ec/api/v1/cashes
 * @returns Promesa que resuelve en un array de objetos Cash.
 */
export const getAllCashes = async (): Promise<Cash[]> => {
  try {
    // Usamos la ruta relativa, el proxy de Vite y el prefijo de Axios hacen el resto.
    const response = await apiClient.get<ApiResponse<Cash>>("/cashes");

    // Obtenemos el array de cajas
    const cashesArray = response.data.data as any[];

    // Limpieza y tipado de los datos recibidos
    const cleanCashes = cashesArray.map((cash) => ({
      ...cash,
      actual_amount: parseFloat(cash.actual_amount.toString()),
    }));
    // -------------------------------------------------------------------------

    return cleanCashes as unknown as Cash[]; // Casteo necesario por diferencias de tipo (null vs undefined) si persistieran
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
    throw error;
  }
};

export type CashUpdateData = { id: number } & Partial<Cash>;

/**
 * Función que realiza la petición POST al backend para crear una nueva caja.
 * Ruta: POST /ec/api/v1/cashes/new-cash
 * @param data Los datos de la caja.
 * @returns Promesa que resuelve en el objeto Cash creado.
 */
export const createCash = async (data: any): Promise<Cash> => {
  try {
    const response = await apiClient.post<ApiResponseData<Cash>>(
      "/cashes/new-cash",
      data
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición PUT al backend para actualizar una caja.
 * Ruta: PUT /ec/api/v1/cashes/:id
 * @param data El objeto con el ID y los datos de la caja a actualizar.
 * @returns Promesa que resuelve en el objeto Cash actualizado.
 */
export const updateCash = async (data: CashUpdateData): Promise<Cash> => {
  try {
    const { id, ...updatePayload } = data;
    const response = await apiClient.put<ApiResponseData<Cash>>(
      `/cashes/${id}`,
      updatePayload
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición DELETE al backend para eliminar una caja.
 * Ruta: DELETE /ec/api/v1/cashes/:id
 * @param id El ID de la caja a eliminar.
 * @returns Promesa que resuelve en un booleano.
 */
export const deleteCash = async (id: number): Promise<boolean> => {
  try {
    const response = await apiClient.delete<ApiResponseData<boolean>>(
      `/cashes/${id}`
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
