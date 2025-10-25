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

    // Obtenemos el array de egresos y aseguramos que cada egreso tenga el formato correcto
    return response.data.data.map(outcome => ({
        ...outcome,
        amount: typeof outcome.amount === 'string' ? parseFloat(outcome.amount) : outcome.amount
    }));
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
    throw error;
  }
};