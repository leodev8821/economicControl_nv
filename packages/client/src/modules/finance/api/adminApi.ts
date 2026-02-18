import apiClient from "@core/api/axios";
import type { ApiResponse } from "@shared/types/apiResponse";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";

/**
 * Ejecuta el script de sincronización de saldos en el servidor.
 */
export const syncBalances = async (): Promise<ApiResponse<void>> => {
  const response = await apiClient.get<ApiResponse<void>>(
    `${API_ROUTES_PATH.FINANCE}/admin/sync-balances`,
  );
  return response.data;
};
