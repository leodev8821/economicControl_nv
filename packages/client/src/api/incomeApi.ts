/* eslint-disable no-useless-catch */
import apiClient from "./axios";
import type { Income, BulkIncomeCreatePayload } from "../types/income.type";
import type { ApiResponse, ApiResponseData } from "../types/apiResponse";
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
    // Usamos la ruta relativa, el proxy de Vite y el prefijo de Axios hacen el resto.
    const response = await apiClient.get<ApiResponse<Income>>("/incomes");

    // Obtenemos el array de ingresos y aseguramos que cada ingreso tenga el formato correcto
    return response.data.data.map(normalizeIncome);
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
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
    // El backend espera la data en el cuerpo (body) de la petición
    // Usamos el tipo IncomeCreationRequest que ya fue validado.
    const response = await apiClient.post<ApiResponseData<Income>>(
      "/incomes/new-income",
      data,
    );

    return normalizeIncome(response.data.data);
  } catch (error) {
    // Si la API devuelve un error 400 o 500, Axios lo capturará aquí.
    // Lo relanzamos para que React Query o el componente lo manejen.
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
    // La ruta incluye el ID. El cuerpo (body) solo lleva los campos a actualizar.
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
    // La ruta incluye el ID
    const response = await apiClient.delete<ApiResponseData<Income>>(
      `/incomes/${id}`,
    );

    // El backend devuelve el objeto Income eliminado o al menos el ID.
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
