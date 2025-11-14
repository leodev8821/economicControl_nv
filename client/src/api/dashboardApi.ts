/* eslint-disable no-useless-catch */
import apiClient from './axios';
import type { Balance } from '../types/balance';
import type { ApiResponse } from '../types/apiResponse';

/**
 * Función que realiza la petición GET al backend para obtener el balance.
 * Ruta: GET /ec/api/v1/balance/get-balance
 * @returns Promesa que resuelve en un array de objetos Cash.
 */
export const getBalance = async (): Promise<Balance[]> => {
  try {
    // Usamos la ruta relativa, el proxy de Vite y el prefijo de Axios hacen el resto.
    const response = await apiClient.get<ApiResponse<Balance>>('/balance/get-balance');

    // Obtenemos el array de balance desde la respuesta
    const balanceArray = response.data.data;

    return balanceArray; // Devolvemos el array de balance
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
    throw error;
  }
};