/* eslint-disable no-useless-catch */
import apiClient from './axios';
import type { Cash } from '../types/cash';
import type { ApiResponse } from '../types/apiResponse';

/**
 * Función que realiza la petición GET al backend para obtener todos las cajas.
 * Ruta: GET /ec/api/v1/cashes
 * @returns Promesa que resuelve en un array de objetos Cash.
 */
export const getAllCashes = async (): Promise<Cash[]> => {
  try {
    // Usamos la ruta relativa, el proxy de Vite y el prefijo de Axios hacen el resto.
    const response = await apiClient.get<ApiResponse<Cash>>('/cashes');

    // Obtenemos el array de egresos
    const cashesArray = response.data.data;
    
    // Limpieza y tipado de los datos recibidos
    const cleanCashes = cashesArray.map(cash => ({
        ...cash,
        actual_mount: parseFloat(cash.actual_amount.toString()),
        pettyCash_limit: cash.pettyCash_limit !== null 
            ? parseFloat(cash.pettyCash_limit.toString()) 
            : null,
    }));
    // -------------------------------------------------------------------------

    return cleanCashes; // Devolvemos el array limpio y tipado correctamente
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
    throw error;
  }
};