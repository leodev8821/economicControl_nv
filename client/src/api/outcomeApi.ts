/* eslint-disable no-useless-catch */
import apiClient from './axios';
import type { Outcome } from '../types/outcome';
import type { ApiResponse } from '../types/apiResponse';

/**
 * Función que realiza la petición GET al backend para obtener todos los ingresos.
 * Ruta: GET /ec/api/v1/outcomes
 * @returns Promesa que resuelve en un array de objetos Outcome.
 */
export const getAllOutcomes = async (): Promise<Outcome[]> => {
  try {
    // Usamos la ruta relativa, el proxy de Vite y el prefijo de Axios hacen el resto.
    const response = await apiClient.get<ApiResponse<Outcome>>('/outcomes');

    // Obtenemos el array de egresos
    const outcomesArray = response.data.data;
    
    // Limpieza y tipado de los datos recibidos
    const cleanOutcomes = outcomesArray.map(outcome => ({
        ...outcome,
        amount: parseFloat(outcome.amount.toString()),
    }));
    // -------------------------------------------------------------------------

    return cleanOutcomes; // Devolvemos el array limpio y tipado correctamente
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
    throw error;
  }
};