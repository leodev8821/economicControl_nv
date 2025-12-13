/* eslint-disable no-useless-catch */
import apiClient from "./axios";
import type { Outcome } from "../types/outcome.type";
import type { ApiResponse, ApiResponseData } from "../types/apiResponse";
import type {
  OutcomeCreationRequest,
  OutcomeUpdateRequest,
} from "@economic-control/shared";

export type OutcomeUpdateData = OutcomeUpdateRequest & { id: number };

/**
 * Función que realiza la petición GET al backend para obtener todos los ingresos.
 * Ruta: GET /ec/api/v1/outcomes
 * @returns Promesa que resuelve en un array de objetos Outcome.
 */
export const getAllOutcomes = async (): Promise<Outcome[]> => {
  try {
    // Usamos la ruta relativa, el proxy de Vite y el prefijo de Axios hacen el resto.
    const response = await apiClient.get<ApiResponse<Outcome>>("/outcomes");

    // Obtenemos el array de egresos y aseguramos que cada egreso tenga el formato correcto
    return response.data.data.map((outcome) => ({
      ...outcome,
      amount:
        typeof outcome.amount === "string"
          ? parseFloat(outcome.amount)
          : outcome.amount,
    }));
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
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
  data: OutcomeCreationRequest
): Promise<Outcome> => {
  try {
    // El backend espera la data en el cuerpo (body) de la petición
    // Usamos el tipo IncomeFormData que ya fue validado.
    const response = await apiClient.post<ApiResponseData<Outcome>>(
      "/outcomes/new-outcome",
      data
    );

    // El controlador devuelve un 201 si es exitoso, con la data del nuevo egreso.
    const outcome = response.data.data;

    // Aseguramos que el amount sea número
    return {
      ...outcome,
      amount:
        typeof outcome.amount === "string"
          ? parseFloat(outcome.amount)
          : outcome.amount,
    };
  } catch (error) {
    // Si la API devuelve un error 400 o 500, Axios lo capturará aquí.
    // Lo relanzamos para que React Query o el componente lo manejen.
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
  data: OutcomeUpdateData
): Promise<Outcome> => {
  try {
    const { id, ...updatePayload } = data;
    // La ruta incluye el ID. El cuerpo (body) solo lleva los campos a actualizar.
    const response = await apiClient.put<ApiResponseData<Outcome>>(
      `/outcomes/${id}`,
      updatePayload
    );

    const outcome = response.data.data;

    // Aseguramos que el amount sea número
    return {
      ...outcome,
      amount:
        typeof outcome.amount === "string"
          ? parseFloat(outcome.amount)
          : outcome.amount,
    };
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
    // La ruta incluye el ID
    const response = await apiClient.delete<ApiResponseData<Outcome>>(
      `/outcomes/${id}`
    );

    // El backend devuelve el objeto Outcome eliminado o al menos el ID.
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
