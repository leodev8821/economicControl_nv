/* eslint-disable no-useless-catch */
import apiClient from './axios';
import type { CashBalance } from '../types/balance'; // Asegúrate de importar el nuevo tipo
import type { ApiResponse } from '../types/apiResponse';

/**
 * Ruta: GET /ec/api/v1/balance/get-balance
 * @returns Promesa que resuelve en un array de objetos CashBalance.
 */
export const getBalance = async (): Promise<CashBalance[]> => {
  try {
    // El endpoint devuelve una lista de cajas con sus balances
    const response = await apiClient.get<ApiResponse<CashBalance>>('/balance/get-balance');

    // Axios + Tu estructura ApiResponse: response.data.data es el array
    return response.data.data; 
  } catch (error) {
    throw error;
  }
};