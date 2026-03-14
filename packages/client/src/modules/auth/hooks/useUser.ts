import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { userApi } from "@modules/auth/api/userApi";
import { AuthQueryKeys } from "@/core/api/queryKeys";
import type {
  UserCreateDTO,
  UserUpdateDTO,
  UserType,
} from "@economic-control/shared";

import { useAuth } from "./useAuth";
import { APPS } from "@shared/constants/app";

// Tipos para los hooks
type UpdateUserParams = {
  id: number;
  data: UserUpdateDTO;
};

// Hook para obtener la lista de usuarios
export const useUsers = (): UseQueryResult<UserType[], Error> => {
  const { user } = useAuth();

  // 1. Identificamos si tiene acceso total (APPS.ALL = 1)
  const hasGlobalAccess =
    user?.role_name === "SuperUser" ||
    user?.permissions.some(
      (p: { application_id: number }) => p.application_id === APPS.ALL,
    );

  // 2. Extraemos el ID de aplicación para el filtro
  const filterAppId = hasGlobalAccess
    ? undefined
    : user?.permissions[0]?.application_id;

  return useQuery<UserType[], Error>({
    queryKey: AuthQueryKeys.users.all(),
    queryFn: () =>
      userApi.getAll({
        applicationId: filterAppId,
      }),
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });
};

// Hook para obtener la lista de líderes de consolidación
export const useConsolidationLeaders = (): UseQueryResult<
  UserType[],
  Error
> => {
  const { user } = useAuth();

  // 1. Identificamos si tiene acceso total (APPS.ALL = 1)
  const hasGlobalAccess =
    user?.role_name === "SuperUser" ||
    user?.permissions.some(
      (p: { application_id: number }) => p.application_id === APPS.ALL,
    );

  // 2. Extraemos el ID de aplicación para el filtro
  const filterAppId = hasGlobalAccess
    ? undefined
    : user?.permissions[0]?.application_id;

  const filterRoleId = 4;

  return useQuery<UserType[], Error>({
    queryKey: AuthQueryKeys.users.all(),
    queryFn: () =>
      userApi.getAll({
        applicationId: filterAppId,
        roleId: filterRoleId,
      }),
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });
};

// Hook para crear un usuario
export const useCreateUser = (): UseMutationResult<
  UserType,
  Error,
  UserCreateDTO
> => {
  const queryClient = useQueryClient();

  return useMutation<UserType, Error, UserCreateDTO>({
    mutationFn: (data) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AuthQueryKeys.users.all(),
        exact: false,
      });
    },
  });
};

// Hook para actualizar un usuario
export const useUpdateUser = (): UseMutationResult<
  UserType,
  Error,
  UpdateUserParams
> => {
  const queryClient = useQueryClient();

  return useMutation<UserType, Error, UpdateUserParams>({
    mutationFn: ({ id, data }: UpdateUserParams) => userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AuthQueryKeys.users.all(),
        exact: false,
      });
    },
  });
};

// Hook para eliminar un usuario
export const useDeleteUser = (): UseMutationResult<
  { message: string },
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => userApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AuthQueryKeys.users.all(),
        exact: false,
      });
    },
  });
};
