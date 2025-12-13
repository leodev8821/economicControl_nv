/* eslint-disable no-useless-catch */
import apiClient from "./axios";
import type { Person, PersonAttributes } from "../types/person.type";
import type { ApiResponse } from "../types/apiResponse";
import type { PersonCreationRequest } from "@economic-control/shared";

/**
 * Función que realiza la petición GET al backend para obtener todos las personas.
 * Ruta: GET /ec/api/v1/persons
 * @returns Promesa que resuelve en un array de objetos Person.
 */
export const getAllPersons = async (): Promise<Person[]> => {
  try {
    // Usamos la ruta relativa, el proxy de Vite y el prefijo de Axios hacen el resto.
    const response = await apiClient.get<ApiResponse<Person>>("/persons");

    // Devolvemos el array limpio y tipado correctamente
    return response.data.data.map((person) => ({
      ...person,
    }));
  } catch (error) {
    // Dejamos que React Query maneje el error en el componente, solo re-lanzamos.
    throw error;
  }
};

export const createPerson = async (
  person: PersonCreationRequest
): Promise<Person> => {
  try {
    const response = await apiClient.post<ApiResponse<Person>>(
      "/persons/new-person",
      person
    );
    return response.data.data[0];
  } catch (error) {
    throw error;
  }
};

export const updatePerson = async ({
  id,
  ...data
}: PersonAttributes): Promise<Person> => {
  try {
    const response = await apiClient.put<ApiResponse<Person>>(
      `/persons/${id}`,
      data
    );
    return response.data.data[0];
  } catch (error) {
    throw error;
  }
};

export const deletePerson = async (id: number): Promise<Person> => {
  try {
    const response = await apiClient.delete<ApiResponse<Person>>(
      `/persons/${id}`
    );
    return response.data.data[0];
  } catch (error) {
    throw error;
  }
};
