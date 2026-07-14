/* eslint-disable no-useless-catch */
import apiClient from "@core/api/axios";
import type {
  Income,
  BulkIncomeCreatePayload,
} from "@modules/finance/types/income.type";
import type { ApiResponse } from "@shared/types/apiResponse";
import type {
  IncomeCreationDTO,
  IncomeUpdateDTO,
} from "@economic-control/shared";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";

export type IncomeUpdateData = IncomeUpdateDTO & { id: number };

/**
 * Helper interno para normalizar el monto de los ingresos.
 */
const normalizeIncome = (income: any): Income => ({
  ...income,
  amount:
    typeof income.amount === "string"
      ? parseFloat(income.amount)
      : income.amount,
});

/**
 * Función que realiza la petición GET al backend para obtener todos los ingresos.
 * Ruta: GET /ec/api/v1/incomes
 */
export const getAllIncomes = async (): Promise<Income[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Income[]>>(
      `${API_ROUTES_PATH.FINANCE}/incomes`,
    );
    return response.data.data.map(normalizeIncome);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene un ingreso por término (ID, persona, etc.).
 * Ruta: GET /ec/api/v1/incomes/:term
 */
export const getOneIncome = async (term: string | number): Promise<Income> => {
  try {
    const response = await apiClient.get<ApiResponse<Income>>(
      `${API_ROUTES_PATH.FINANCE}/incomes/${term}`,
    );
    return normalizeIncome(response.data.data);
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición POST al backend para crear un nuevo ingreso.
 * Ruta: POST /ec/api/v1/incomes
 */
export const createIncome = async (
  data: IncomeCreationDTO,
): Promise<Income> => {
  try {
    const response = await apiClient.post<ApiResponse<Income>>(
      `${API_ROUTES_PATH.FINANCE}/incomes`,
      data,
    );
    return normalizeIncome(response.data.data);
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición POST al backend para crear varios ingresos.
 * Ruta: POST /ec/api/v1/incomes/bulk
 */
export const createBulkIncome = async (
  data: BulkIncomeCreatePayload,
): Promise<Income[]> => {
  try {
    // Asegúrate de que esta ruta coincida con tu router en Express
    const response = await apiClient.post<ApiResponse<Income[]>>(
      `${API_ROUTES_PATH.FINANCE}/incomes/bulk`,
      data,
    );
    return response.data.data.map(normalizeIncome);
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición PUT al backend para actualizar un ingreso.
 * Ruta: PUT /ec/api/v1/incomes/:id
 */
export const updateIncome = async (data: IncomeUpdateData): Promise<Income> => {
  try {
    const { id, ...updatePayload } = data;
    const response = await apiClient.put<ApiResponse<Income>>(
      `${API_ROUTES_PATH.FINANCE}/incomes/${id}`,
      updatePayload,
    );
    return normalizeIncome(response.data.data);
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición DELETE al backend para eliminar un ingreso.
 * Ruta: DELETE /ec/api/v1/incomes/:id
 */
export const deleteIncome = async (id: number): Promise<boolean> => {
  try {
    const response = await apiClient.delete<ApiResponse<boolean>>(
      `${API_ROUTES_PATH.FINANCE}/incomes/${id}`,
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};