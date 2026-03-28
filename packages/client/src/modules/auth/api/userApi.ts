/* eslint-disable no-useless-catch */
import { createCrudApi } from "@/core/api/apiServiceFactory";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";
import type {
  UserCreateDTO,
  UserUpdateDTO,
  UserType,
} from "@economic-control/shared";

type UserFilters = {
  applicationId?: number | undefined;
  roleId?: number | number[] | undefined;
};

/**
 * API para la gestión de usuarios
 */
export const userApi = createCrudApi<
  UserType,
  UserCreateDTO,
  UserUpdateDTO,
  UserFilters
>(`${API_ROUTES_PATH.AUTH}/users`);
