import { createCrudApi } from "@/core/api/apiServiceFactory";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";
import type {
  MemberType,
  MemberCreateDTO,
  MemberUpdateDTO,
  BulkMemberCreateDTO,
} from "@economic-control/shared";

/**
 * API para la gestión de miembros.
 */
export const memberApi = createCrudApi<
  MemberType,
  MemberCreateDTO,
  MemberUpdateDTO,
  BulkMemberCreateDTO
>(`${API_ROUTES_PATH.CONSOLIDATION}/members`);
