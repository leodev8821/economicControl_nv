/* eslint-disable no-useless-catch */
import apiClient from "./axios";
import type { Week } from "../types/week.type";
import type { ApiResponse } from "../types/apiResponse";

/**
 * Función que realiza la petición GET al backend para obtener todos las semanas.
 * Ruta: GET /ec/api/v1/weeks
 * @returns Promesa que resuelve en un array de objetos Week.
 */
export const getAllWeeks = async (): Promise<Week[]> => {
  try {
    // Usamos la ruta relativa, el proxy de Vite y el prefijo de Axios hacen el resto.
    const response = await apiClient.get<ApiResponse<Week>>("/weeks");

    // Devolvemos el array limpio y tipado correctamente
    return response.data.data.map((week) => ({
      ...week,
    }));
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
    throw error;
  }
};
