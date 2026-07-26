import { createCrudApi } from "@/core/api/apiServiceFactory";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";
import type {
  BillDetailType,
  BillDetailCreationDTO,
  BillDetailUpdateDTO
} from "@economic-control/shared";

/**
 * API para la gestión de detalles de facturas.
 */
export const billDetailsApi = createCrudApi<
  BillDetailType,
  BillDetailCreationDTO,
  BillDetailUpdateDTO,
  any
>(`${API_ROUTES_PATH.CAFETERIA}/bill-details`);