/* eslint-disable no-useless-catch */
import apiClient from './axios';
import type { Income } from '../types/income';
import type { ApiResponse, ApiResponseData } from '../types/apiResponse';
import type { IncomeFormData } from '../schemas/income.schema';

/**
 * Función que realiza la petición GET al backend para obtener todos los ingresos.
 * Ruta: GET /ec/api/v1/incomes
 * @returns Promesa que resuelve en un array de objetos Income.
 */
export const getAllIncomes = async (): Promise<Income[]> => {
  try {
    // Usamos la ruta relativa, el proxy de Vite y el prefijo de Axios hacen el resto.
    const response = await apiClient.get<ApiResponse<Income>>('/incomes');

    // Obtenemos el array de ingresos y aseguramos que cada ingreso tenga el formato correcto
    return response.data.data.map(income => ({
        ...income,
        amount: typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount
    }));
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
    throw error;
  }
};

/**
 * Función que realiza la petición POST al backend para crear un nuevo ingreso.
 * Ruta: POST /ec/api/v1/incomes/new-income
 * @param data Los datos del ingreso validados por Zod.
 * @returns Promesa que resuelve en el objeto Income creado.
 */
export const createIncome = async (data: IncomeFormData): Promise<Income> => {
  try {
    // El backend espera la data en el cuerpo (body) de la petición
    // Usamos el tipo IncomeFormData que ya fue validado.
    const response = await apiClient.post<ApiResponseData<Income>>('/incomes/new-income', data);
    
    // El controlador devuelve un 201 si es exitoso, con la data del nuevo ingreso.
    const income = response.data.data;
    
    // Aseguramos que el amount sea número
    return {
        ...income,
        amount: typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount
    };
  } catch (error) {
    // Si la API devuelve un error 400 o 500, Axios lo capturará aquí.
    // Lo relanzamos para que React Query o el componente lo manejen.
    throw error;
  }
};