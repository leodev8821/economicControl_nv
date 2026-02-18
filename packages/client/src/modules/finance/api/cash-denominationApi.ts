import apiClient from "@core/api/axios";
import type { CashDenomination } from "@modules/finance/types/cash-denomination.type";
import type { ApiResponse, ApiResponseData } from "@shared/types/apiResponse";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";

export type CashDenominationUpdateData = {
  id: number;
} & Partial<CashDenomination>;

/**
 * Obtiene todas las denominaciones (global).
 * Ruta: GET /cashes/cash-denominations
 */
export const getAllCashDenominations = async (): Promise<
  CashDenomination[]
> => {
  try {
    const response = await apiClient.get<ApiResponse<CashDenomination>>(
      `${API_ROUTES_PATH.FINANCE}/cashes/cash-denominations`,
    );
    const denominationsArray = response.data.data as any[];
    return denominationsArray.map((denomination) => ({
      ...denomination,
      denomination_value: parseFloat(
        denomination.denomination_value.toString(),
      ),
      quantity: parseFloat(denomination.quantity.toString()),
    })) as CashDenomination[];
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene las denominaciones de una caja específica.
 * Ruta: GET /cashes/:cash_id/denominations
 */
export const getCashDenominationsByCashId = async (
  cashId: number,
): Promise<CashDenomination[]> => {
  try {
    const response = await apiClient.get<ApiResponse<CashDenomination>>(
      `${API_ROUTES_PATH.FINANCE}/cashes/${cashId}/denominations`,
    );
    const denominationsArray = response.data.data as any[];

    return denominationsArray.map((denomination) => ({
      ...denomination,
      denomination_value: parseFloat(
        denomination.denomination_value.toString(),
      ),
      quantity: parseFloat(denomination.quantity.toString()),
    })) as CashDenomination[];
  } catch (error) {
    throw error;
  }
};

/**
 * Crea una nueva denominación asignada a una caja.
 * Ruta: POST /cashes/:cash_id/denominations
 */
export const createCashDenomination = async (
  cashId: number,
  data: Partial<CashDenomination>,
): Promise<CashDenomination> => {
  try {
    const response = await apiClient.post<ApiResponseData<CashDenomination>>(
      `${API_ROUTES_PATH.FINANCE}/cashes/${cashId}/denominations`,
      data,
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza una denominación por su ID.
 * Ruta: PUT /cashes/cash-denominations/:denomination_id
 */
export const updateCashDenomination = async (
  data: CashDenominationUpdateData,
): Promise<CashDenomination> => {
  try {
    const { id, ...updatePayload } = data;
    const response = await apiClient.put<ApiResponseData<CashDenomination>>(
      `${API_ROUTES_PATH.FINANCE}/cashes/cash-denominations/${id}`,
      updatePayload,
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Elimina una denominación por su ID.
 * Ruta: DELETE /cashes/cash-denominations/:denomination_id
 */
export const deleteCashDenomination = async (id: number): Promise<boolean> => {
  try {
    const response = await apiClient.delete<ApiResponseData<boolean>>(
      `${API_ROUTES_PATH.FINANCE}/cashes/cash-denominations/${id}`,
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
