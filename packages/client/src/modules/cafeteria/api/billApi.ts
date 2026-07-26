import { createCrudApi } from "@/core/api/apiServiceFactory";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";
import type {
  BillType,
  BillCreationDTO,
  BillUpdateDTO
} from "@economic-control/shared";

/**
 * API para la gestión de facturas.
 */
export const billsApi = createCrudApi<
  BillType,
  BillCreationDTO,
  BillUpdateDTO,
  any
>(`${API_ROUTES_PATH.CAFETERIA}/bills`);