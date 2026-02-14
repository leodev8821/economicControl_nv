import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@modules/auth/api/userApi";
import type { User, UserAttributes } from "@modules/auth/types/user.type";
import type { UserCreationRequest } from "@economic-control/shared";
import { useAuth } from "./useAuth";
import { APPS } from "@shared/constants/app";

// Clave única para la consulta de usuarios
const USERS_QUERY_KEY = "users";

// Hook para obtener la lista de usuarios
export const useUsers = (): UseQueryResult<User[], Error> => {
  const { user } = useAuth();

  // 1. Identificamos si tiene acceso total (APPS.ALL = 1)
  const hasGlobalAccess =
    user?.role_name === "SuperUser" ||
    user?.permissions.some((p) => p.application_id === APPS.ALL);

  // 2. Extraemos el ID de aplicación para el filtro
  const filterAppId = hasGlobalAccess
    ? undefined
    : user?.permissions[0]?.application_id;

  return useQuery<User[], Error>({
    queryKey: [USERS_QUERY_KEY, filterAppId],
    queryFn: () => getAllUsers(filterAppId),
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });
};

// Hook para crear un usuario
export const useCreateUser = (): UseMutationResult<
  User,
  Error,
  UserCreationRequest
> => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UserCreationRequest>({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
};

// Hook para actualizar un usuario
export const useUpdateUser = (): UseMutationResult<
  User,
  Error,
  UserAttributes
> => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UserAttributes>({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
};

// Hook para eliminar un usuario
export const useDeleteUser = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
};
