import { createCrudApi } from "@/core/api/apiServiceFactory";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";
import type {
  ConsolidationCreationDTO,
  BulkConsolidationCreationDTO,
  ConsolidationUpdateDTO,
  ConsolidationType,
} from "@economic-control/shared";

/**
 * API para la gestión de consolidaciones.
 */
export const consolidationApi = createCrudApi<
  ConsolidationType,
  ConsolidationCreationDTO,
  ConsolidationUpdateDTO,
  BulkConsolidationCreationDTO
>(`${API_ROUTES_PATH.CONSOLIDATION}/consolidations`);
