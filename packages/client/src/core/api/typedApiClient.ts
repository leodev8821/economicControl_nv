import apiClient from "./axios";
import type { ApiResponse } from "@/shared/types/apiResponse";

/**
 * Cliente API tipado que envuelve las peticiones HTTP.
 */
export const typedApiClient = {
  async get<T>(
    url: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(url, { params });
    return response.data.data;
  },

  async post<T, B = unknown>(url: string, body?: B): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(url, body);
    return response.data.data;
  },

  async put<T, B = unknown>(url: string, body?: B): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(url, body);
    return response.data.data;
  },

  async delete<T>(url: string): Promise<T> {
    const response = await apiClient.delete<ApiResponse<T>>(url);
    return response.data.data;
  },
};
