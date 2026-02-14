/* eslint-disable no-useless-catch */
import apiClient from "@core/api/axios";
import type { Week } from "@modules/finance/types/week.type";
import type { ApiResponse } from "@shared/types/apiResponse";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";

/**
 * Función que realiza la petición GET al backend para obtener todos las semanas.
 * Ruta: GET /ec/api/v1/weeks
 * @returns Promesa que resuelve en un array de objetos Week.
 */
export const getAllWeeks = async (): Promise<Week[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Week>>(
      `${API_ROUTES_PATH.FINANCE}/weeks`,
    );

    return response.data.data.map((week) => ({
      ...week,
    }));
  } catch (error) {
    throw error;
  }
};
