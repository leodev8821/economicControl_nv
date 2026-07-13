/* eslint-disable no-useless-catch */
import apiClient from "@core/api/axios";
import type { Person } from "@modules/finance/types/person.type";
import type { ApiResponse } from "@shared/types/apiResponse";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";

export type PersonUpdateData = { id: number } & Partial<Person>;

/**
 * Función que realiza la petición GET al backend para obtener todas las personas.
 * Ruta: GET /ec/api/v1/persons
 * @returns Promesa que resuelve en un array de objetos Person.
 */
export const getAllPersons = async (): Promise<Person[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Person[]>>(
      `${API_ROUTES_PATH.FINANCE}/persons`,
    );

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene una persona por término (ID, nombre o DNI).
 * Ruta: GET /ec/api/v1/persons/:term
 * @param term - Término de búsqueda.
 * @returns Promesa que resuelve en un objeto Person.
 */
export const getOnePerson = async (term: string | number): Promise<Person> => {
  try {
    const response = await apiClient.get<ApiResponse<Person>>(
      `${API_ROUTES_PATH.FINANCE}/persons/${term}`,
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición POST al backend para crear una nueva persona.
 * Ruta: POST /ec/api/v1/persons
 * @param data - Los datos de la persona a crear.
 * @returns Promesa que resuelve en el objeto Person creado.
 */
export const createPerson = async (data: any): Promise<Person> => {
  try {
    const response = await apiClient.post<ApiResponse<Person>>(
      `${API_ROUTES_PATH.FINANCE}/persons`,
      data,
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición PUT al backend para actualizar una persona.
 * Ruta: PUT /ec/api/v1/persons/:id
 * @param data - El objeto con el ID y los datos de la persona a actualizar.
 * @returns Promesa que resuelve en el objeto Person actualizado.
 */
export const updatePerson = async (data: PersonUpdateData): Promise<Person> => {
  try {
    const { id, ...updatePayload } = data;
    const response = await apiClient.put<ApiResponse<Person>>(
      `${API_ROUTES_PATH.FINANCE}/persons/${id}`,
      updatePayload,
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición DELETE al backend para eliminar una persona.
 * Ruta: DELETE /ec/api/v1/persons/:id
 * @param id - El ID de la persona a eliminar.
 * @returns Promesa que resuelve en un booleano.
 */
export const deletePerson = async (id: number): Promise<boolean> => {
  try {
    const response = await apiClient.delete<ApiResponse<boolean>>(
      `${API_ROUTES_PATH.FINANCE}/persons/${id}`,
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};