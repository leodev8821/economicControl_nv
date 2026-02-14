import apiClient from "@/core/api/axios";
import type { Application } from "../hooks/useApplications";
import { API_ROUTES_PATH } from "@/core/api/appsApiRoute";

export const getAllApplications = async (): Promise<Application[]> => {
  const { data } = await apiClient.get(`${API_ROUTES_PATH.AUTH}/applications`);
  return data.data;
};
