import { createCrudApi } from "@/core/api/apiServiceFactory";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";
import type {
  NetworkType,
  NetworkCreationDTO,
  NetworkUpdateDTO,
} from "@economic-control/shared";

/**
 * API para la gestión de redes.
 */
export const networkApi = createCrudApi<
  NetworkType,
  NetworkCreationDTO,
  NetworkUpdateDTO
>(`${API_ROUTES_PATH.CONSOLIDATION}/networks`);
