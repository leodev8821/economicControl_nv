/* eslint-disable no-useless-catch */
import apiClient from "@core/api/axios";
import type {
  Outcome,
  BulkOutcomeCreatePayload,
} from "@modules/finance/types/outcome.type";
import type { ApiResponse, ApiResponseData } from "@shared/types/apiResponse";
import type {
  OutcomeCreationRequest,
  ConsolidationUpdateRequest,
} from "@economic-control/shared";

export type OutcomeUpdateData = ConsolidationUpdateRequest & { id: number };

/**
 * Helper interno para normalizar el monto de los egresos.
 */
const normalizeOutcome = (outcome: any): Outcome => ({
  ...outcome,
  amount:
    typeof outcome.amount === "string"
      ? parseFloat(outcome.amount)
      : outcome.amount,
});

/**
 * Función que realiza la petición GET al backend para obtener todos los ingresos.
 * Ruta: GET /ec/api/v1/outcomes
 * @returns Promesa que resuelve en un array de objetos Outcome.
 */
export const getAllOutcomes = async (): Promise<Outcome[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Outcome>>("/outcomes");

    return response.data.data.map(normalizeOutcome);
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición POST al backend para crear un nuevo egreso.
 * Ruta: POST /ec/api/v1/outcomes/new-outcome
 * @param data Los datos del egreso validados por Zod.
 * @returns Promesa que resuelve en el objeto Outcome creado.
 */
export const createOutcome = async (
  data: OutcomeCreationRequest,
): Promise<Outcome> => {
  try {
    const response = await apiClient.post<ApiResponseData<Outcome>>(
      "/outcomes/new-outcome",
      data,
    );

    return normalizeOutcome(response.data.data);
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición POST al backend para crear varios egresos.
 * Ruta: POST /ec/api/v1/outcomes/bulk-outcomes
 * @param data Los datos de los egresos validados por Zod.
 * @returns Promesa que resuelve en el array de egresos creados.
 */
export const createBulkOutcome = async (
  data: BulkOutcomeCreatePayload,
): Promise<Outcome[]> => {
  try {
    const response = await apiClient.post<ApiResponseData<Outcome[]>>(
      "/outcomes/bulk-outcomes",
      data,
    );

    const outcomes = response.data.data;
    return outcomes.map(normalizeOutcome);
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición PUT al backend para actualizar un egreso.
 * Ruta: PUT /ec/api/v1/outcomes/:id
 * @param data El objeto con el ID y los datos del egreso a actualizar.
 * @returns Promesa que resuelve en el objeto Outcome actualizado.
 */
export const updateOutcome = async (
  data: OutcomeUpdateData,
): Promise<Outcome> => {
  try {
    const { id, ...updatePayload } = data;
    const response = await apiClient.put<ApiResponseData<Outcome>>(
      `/outcomes/${id}`,
      updatePayload,
    );

    return normalizeOutcome(response.data.data);
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición DELETE al backend para eliminar un egreso.
 * Ruta: DELETE /ec/api/v1/outcomes/:id
 * @param id El ID del egreso a eliminar.
 * @returns Promesa que resuelve en el objeto Outcome eliminado (o un mensaje de éxito).
 */
export const deleteOutcome = async (id: number): Promise<Outcome> => {
  try {
    const response = await apiClient.delete<ApiResponseData<Outcome>>(
      `/outcomes/${id}`,
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
