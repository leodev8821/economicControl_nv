/* eslint-disable no-useless-catch */
import apiClient from './axios';
import type { Income } from '../types/income';
import type { ApiResponse } from '../types/apiResponse';

/**
 * Función que realiza la petición GET al backend para obtener todos los ingresos.
 * Ruta: GET /ec/api/v1/incomes
 * @returns Promesa que resuelve en un array de objetos Income.
 */
export const getAllIncomes = async (): Promise<Income[]> => {
  try {
    // Usamos la ruta relativa, el proxy de Vite y el prefijo de Axios hacen el resto.
    const response = await apiClient.get<ApiResponse<Income>>('/incomes');

    // Obtenemos el array de ingresos
    const incomesArray = response.data.data;
    
    // Limpieza y tipado de los datos recibidos
    const cleanIncomes = incomesArray.map(income => ({
        ...income,
        amount: parseFloat(income.amount.toString()),
    }));
    // -------------------------------------------------------------------------
    return cleanIncomes; // Devolvemos el array limpio y tipado correctamente
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
    throw error;
  }
};