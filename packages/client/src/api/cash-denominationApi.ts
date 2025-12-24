import apiClient from "./axios";
import type { CashDenomination } from "../types/cash-denomination.type";
import type { ApiResponse, ApiResponseData } from "../types/apiResponse";

export type CashDenominationUpdateData = {
  id: number;
} & Partial<CashDenomination>;

/**
 * Función que realiza la petición GET al backend para obtener todos las denominaciones de monedas.
 * Ruta: GET /ec/api/v1/cash-denominations
 * @returns Promesa que resuelve en un array de objetos CashDenomination.
 */
export const getAllCashDenominations = async (): Promise<
  CashDenomination[]
> => {
  try {
    // Usamos la ruta relativa, el proxy de Vite y el prefijo de Axios hacen el resto.
    const response = await apiClient.get<ApiResponse<CashDenomination>>(
      "/cash-denominations"
    );

    // Obtenemos el array de cajas
    const denominationsArray = response.data.data as any[];

    // Limpieza y tipado de los datos recibidos
    const cleanDenominations = denominationsArray.map((denomination) => ({
      ...denomination,
      quantity: parseFloat(denomination.quantity.toString()),
    }));
    // -------------------------------------------------------------------------

    return cleanDenominations as CashDenomination[];
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
    throw error;
  }
};

/**
 * Función que realiza la petición POST al backend para crear una nueva denominación de monedas.
 * Ruta: POST /ec/api/v1/cash-denominations/new-cash-denomination
 * @param data Los datos de la denominación de monedas.
 * @returns Promesa que resuelve en el objeto CashDenomination creado.
 */
export const createCashDenomination = async (
  data: any
): Promise<CashDenomination> => {
  try {
    const response = await apiClient.post<ApiResponseData<CashDenomination>>(
      "/cash-denominations/new-cash-denomination",
      data
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición PUT al backend para actualizar una denominación de monedas.
 * Ruta: PUT /ec/api/v1/cash-denominations/:id
 * @param data El objeto con el ID y los datos de la denominación de monedas a actualizar.
 * @returns Promesa que resuelve en el objeto CashDenomination actualizado.
 */
export const updateCashDenomination = async (
  data: CashDenominationUpdateData
): Promise<CashDenomination> => {
  try {
    const { id, ...updatePayload } = data;
    const response = await apiClient.put<ApiResponseData<CashDenomination>>(
      `/cash-denominations/${id}`,
      updatePayload
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición DELETE al backend para eliminar una denominación de monedas.
 * Ruta: DELETE /ec/api/v1/cash-denominations/:id
 * @param id El ID de la denominación de monedas a eliminar.
 * @returns Promesa que resuelve en un booleano.
 */
export const deleteCashDenomination = async (id: number): Promise<boolean> => {
  try {
    const response = await apiClient.delete<ApiResponseData<boolean>>(
      `/cash-denominations/${id}`
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
