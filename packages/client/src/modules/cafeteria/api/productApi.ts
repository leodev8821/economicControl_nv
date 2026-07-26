import { createCrudApi } from "@/core/api/apiServiceFactory";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";
import type {
  ProductType,
  ProductCreationDTO,
  ProductUpdateDTO
} from "@economic-control/shared";

/**
 * API para la gestión de productos.
 */
export const productsApi = createCrudApi<
  ProductType,
  ProductCreationDTO,
  ProductUpdateDTO,
  any
>(`${API_ROUTES_PATH.CAFETERIA}/products`);