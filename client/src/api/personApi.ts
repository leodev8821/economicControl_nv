/* eslint-disable no-useless-catch */
import apiClient from './axios';
import type { Person } from '../types/person';
import type { ApiResponse } from '../types/apiResponse';

/**
 * Función que realiza la petición GET al backend para obtener todos las personas.
 * Ruta: GET /ec/api/v1/persons
 * @returns Promesa que resuelve en un array de objetos Person.
 */
export const getAllPersons = async (): Promise<Person[]> => {
  try {
    // Usamos la ruta relativa, el proxy de Vite y el prefijo de Axios hacen el resto.
    const response = await apiClient.get<ApiResponse<Person>>('/persons');

    // Devolvemos el array limpio y tipado correctamente
    return response.data.data.map(person => ({
        ...person
    }));
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
    throw error;
  }
};