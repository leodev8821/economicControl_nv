import apiClient from "@/core/api/axios";
import type { Role } from "../hooks/useRoles";

export const getAllRoles = async (): Promise<Role[]> => {
  const { data } = await apiClient.get("/auth/roles");
  return data.data;
};
