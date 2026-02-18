/* eslint-disable no-useless-catch */
import apiClient from "@core/api/axios";
import type { Week } from "@modules/finance/types/week.type";
import type { ApiResponse } from "@shared/types/apiResponse";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";

/**
 * Obtiene todas las semanas desde el backend.
 * Ruta: GET /ec/api/v1/finance/weeks
 * @returns Promesa que resuelve en la respuesta completa de la API con el array de Weeks.
 */
export const getAllWeeks = async (): Promise<ApiResponse<Week>> => {
  try {
    // 1. Cambiamos <ApiResponse<Week>> por <ApiResponse<Week>> porque esperamos una lista
    const response = await apiClient.get<ApiResponse<Week>>(
      `${API_ROUTES_PATH.FINANCE}/weeks`,
    );

    // 2. Retornamos la respuesta completa (response.data) para que el hook useWeeks
    // tenga acceso a los metadatos como 'ok' y 'message' además de 'data'.
    return response.data;
  } catch (error) {
    throw error;
  }
};
