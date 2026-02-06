/* eslint-disable no-useless-catch */
import apiClient from "@core/api/axios";
import type {
  Person,
  PersonAttributes,
} from "@modules/finance/types/person.type";
import type { ApiResponse } from "@shared/types/apiResponse";
import type { PersonCreationRequest } from "@economic-control/shared";

/**
 * Función que realiza la petición GET al backend para obtener todos las personas.
 * Ruta: GET /ec/api/v1/persons
 * @returns Promesa que resuelve en un array de objetos Person.
 */
export const getAllPersons = async (): Promise<Person[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Person>>("/persons");

    return response.data.data.map((person) => ({
      ...person,
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición POST al backend para crear una persona.
 * Ruta: POST /ec/api/v1/persons/new-person
 * @param person - Objeto con los datos de la persona a crear.
 * @returns Promesa que resuelve en un objeto Person.
 */
export const createPerson = async (
  person: PersonCreationRequest,
): Promise<Person> => {
  try {
    const response = await apiClient.post<ApiResponse<Person>>(
      "/persons/new-person",
      person,
    );
    return response.data.data[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición PUT al backend para actualizar una persona.
 * Ruta: PUT /ec/api/v1/persons/{id}
 * @param id - ID de la persona a actualizar.
 * @param data - Objeto con los datos de la persona a actualizar.
 * @returns Promesa que resuelve en un objeto Person.
 */
export const updatePerson = async ({
  id,
  ...data
}: PersonAttributes): Promise<Person> => {
  try {
    const response = await apiClient.put<ApiResponse<Person>>(
      `/persons/${id}`,
      data,
    );
    return response.data.data[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Función que realiza la petición DELETE al backend para eliminar una persona.
 * Ruta: DELETE /ec/api/v1/persons/{id}
 * @param id - ID de la persona a eliminar.
 * @returns Promesa que resuelve en un objeto Person.
 */
export const deletePerson = async (id: number): Promise<Person> => {
  try {
    const response = await apiClient.delete<ApiResponse<Person>>(
      `/persons/${id}`,
    );
    return response.data.data[0];
  } catch (error) {
    throw error;
  }
};
