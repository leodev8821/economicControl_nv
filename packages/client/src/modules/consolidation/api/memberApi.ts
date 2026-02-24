import apiClient from "@/core/api/axios";
import type {
  Member,
  MemberAttributes,
} from "@modules/consolidation/types/member.type";
import type { ApiResponse } from "@shared/types/apiResponse";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";
import type { MemberCreationRequest } from "@economic-control/shared";

/**
 * Función que realiza la peticion GET al backend para obtener todos los miembros.
 * Ruta: GET /ec/api/v1/members
 * @returns Promesa que resuelve en un array de objetos Member.
 */
export const getAllMembers = async (): Promise<Member[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Member>>(
      `${API_ROUTES_PATH.CONSOLIDATION}/members`,
    );
    return response.data.data.map((member) => ({
      ...member,
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene un miembro por su ID.
 * @param id ID del miembro.
 * @returns Promesa que resuelve en un objeto Member.
 */
export const getOneMember = async (id: number): Promise<Member> => {
  try {
    const response = await apiClient.get<ApiResponse<Member>>(
      `${API_ROUTES_PATH.CONSOLIDATION}/members/${id}`,
    );
    return response.data.data[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Crea un miembro.
 * @param member Objeto MemberRegisterCreationRequest.
 * @returns Promesa que resuelve en un objeto Member.
 */
export const createMember = async (
  member: MemberCreationRequest,
): Promise<Member> => {
  try {
    const response = await apiClient.post<ApiResponse<Member>>(
      `${API_ROUTES_PATH.CONSOLIDATION}/members/new-member`,
      member,
    );
    return response.data.data[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Crea múltiples miembros.
 * @param members Array de objetos MemberRegisterCreationRequest.
 * @returns Promesa que resuelve en un array de objetos Member.
 */
export const createBulkMembers = async (
  members: MemberCreationRequest[],
): Promise<Member[]> => {
  try {
    const response = await apiClient.post<ApiResponse<Member>>(
      `${API_ROUTES_PATH.CONSOLIDATION}/members/new-members`,
      { members },
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza un miembro.
 * @param member Objeto MemberAttributes.
 * @returns Promesa que resuelve en un objeto Member.
 */
export const updateMember = async (
  member: MemberAttributes,
): Promise<Member> => {
  try {
    const response = await apiClient.put<ApiResponse<Member>>(
      `${API_ROUTES_PATH.CONSOLIDATION}/members/${member.id}`,
      member,
    );
    return response.data.data[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Elimina un miembro.
 * @param id ID del miembro.
 * @returns Promesa que resuelve en un mensaje.
 */
export const deleteMember = async (id: number): Promise<string> => {
  try {
    const response = await apiClient.delete<ApiResponse<Member>>(
      `${API_ROUTES_PATH.CONSOLIDATION}/members/${id}`,
    );
    return response.data.message?.[0] || "";
  } catch (error) {
    throw error;
  }
};
