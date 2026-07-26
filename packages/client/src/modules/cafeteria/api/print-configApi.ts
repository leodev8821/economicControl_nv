import { createCrudApi } from "@/core/api/apiServiceFactory";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";
import type {
  PrintConfigType,
  PrintConfigUpdateDTO,
} from "@economic-control/shared";

/**
 * API para la gestión de detalles de facturas.
 */
export const printConfigApi = createCrudApi<
  PrintConfigType,
  PrintConfigUpdateDTO,
  any
>(`${API_ROUTES_PATH.CAFETERIA}/print-config`);