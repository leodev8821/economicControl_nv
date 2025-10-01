/* eslint-disable no-useless-catch */
import apiClient from './axios';
import type { Income } from '../types/income'; 

/**
 * Función que realiza la petición GET al backend para obtener todos los ingresos.
 * Ruta: GET /ec/api/v1/incomes
 * @returns Promesa que resuelve en un array de objetos Income.
 */
export const getAllIncomes = async (): Promise<Income[]> => {
  try {
    // Usamos la ruta relativa, el proxy de Vite y el prefijo de Axios hacen el resto.
    const response = await apiClient.get<Income[]>('/incomes');
    
    // El backend de Node+MySQL debería devolver un array en response.data
    return response.data;
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
    throw error;
  }
};