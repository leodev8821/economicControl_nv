/* eslint-disable no-useless-catch */
import apiClient from "@core/api/axios";
import type { CashBalance } from "@modules/finance/types/balance.type";
import type { ApiResponse } from "@shared/types/apiResponse";

/**
 * Ruta: GET /ec/api/v1/balance/get-balance
 * @returns Promesa que resuelve en un array de objetos CashBalance.
 */
export const getBalance = async (): Promise<ApiResponse<CashBalance>> => {
  try {
    const response = await apiClient.get<ApiResponse<CashBalance>>(
      "/finance/balance/get-balance",
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
