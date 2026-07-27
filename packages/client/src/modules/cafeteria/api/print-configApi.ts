import { createCrudApi } from "@/core/api/apiServiceFactory";
import { typedApiClient } from "@/core/api/typedApiClient";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";
import type {
  PrintConfigType,
  PrintConfigUpdateDTO,
} from "@economic-control/shared";

const BASE_URL = `${API_ROUTES_PATH.CAFETERIA}/print-config`;

/**
 * API para la gestión de la configuración de impresión (Singleton).
 */
const baseApi = createCrudApi<
  PrintConfigType,
  PrintConfigUpdateDTO,
  any
>(BASE_URL);

export const printConfigApi = {
  ...baseApi,
  update: async (_id: number, data: PrintConfigUpdateDTO): Promise<PrintConfigType> => {
    return typedApiClient.put<PrintConfigType, PrintConfigUpdateDTO>(BASE_URL, data);
  },
};