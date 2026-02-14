import apiClient from "@/core/api/axios";
import type { Role } from "../hooks/useRoles";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";

export const getAllRoles = async (): Promise<Role[]> => {
  const { data } = await apiClient.get(`${API_ROUTES_PATH.AUTH}/roles`);
  return data.data;
};
