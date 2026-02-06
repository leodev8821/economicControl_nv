/* eslint-disable no-useless-catch */
import apiClient from "@core/api/axios";
import type {
  Income,
  BulkIncomeCreatePayload,
} from "@modules/finance/types/income.type";
import type { ApiResponse, ApiResponseData } from "@shared/types/apiResponse";
import type {
  IncomeCreationRequest,
  IncomeUpdateRequest,
} from "@economic-control/shared";

export type IncomeUpdateData = IncomeUpdateRequest & { id: number };

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
 * @returns Promesa que resuelve en un array de objetos Income.
 */
export const getAllIncomes = async (): Promise<Income[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Income>>("/incomes");

    return response.data.data.map(normalizeIncome);
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición POST al backend para crear un nuevo ingreso.
 * Ruta: POST /ec/api/v1/incomes/new-income
 * @param data Los datos del ingreso validados por Zod.
 * @returns Promesa que resuelve en el objeto Income creado.
 */
export const createIncome = async (
  data: IncomeCreationRequest,
): Promise<Income> => {
  try {
    const response = await apiClient.post<ApiResponseData<Income>>(
      "/incomes/new-income",
      data,
    );

    return normalizeIncome(response.data.data);
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición POST al backend para crear varios ingresos.
 * Ruta: POST /ec/api/v1/incomes/bulk-incomes
 * @param data Los datos del ingreso validados por Zod.
 * @returns Promesa que resuelve en el objeto Income creado.
 */
export const createBulkIncome = async (
  data: BulkIncomeCreatePayload,
): Promise<Income[]> => {
  try {
    const response = await apiClient.post<ApiResponseData<Income[]>>(
      "/incomes/bulk-incomes",
      data,
    );

    const incomes = response.data.data;
    return incomes.map(normalizeIncome);
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición PUT al backend para actualizar un ingreso.
 * Ruta: PUT /ec/api/v1/incomes/:id
 * @param data El objeto con el ID y los datos del ingreso a actualizar.
 * @returns Promesa que resuelve en el objeto Income actualizado.
 */
export const updateIncome = async (data: IncomeUpdateData): Promise<Income> => {
  try {
    const { id, ...updatePayload } = data;
    const response = await apiClient.put<ApiResponseData<Income>>(
      `/incomes/${id}`,
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
 * @param id El ID del ingreso a eliminar.
 * @returns Promesa que resuelve en el objeto Income eliminado (o un mensaje de éxito).
 */
export const deleteIncome = async (id: number): Promise<Income> => {
  try {
    const response = await apiClient.delete<ApiResponseData<Income>>(
      `/incomes/${id}`,
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
