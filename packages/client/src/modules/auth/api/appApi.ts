import apiClient from "@/core/api/axios";
import type { Application } from "../hooks/useApplications";

export const getAllApplications = async (): Promise<Application[]> => {
  const { data } = await apiClient.get("/auth/applications");
  return data.data;
};
