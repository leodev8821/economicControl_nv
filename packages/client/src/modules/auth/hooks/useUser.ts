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

// Clave única para la consulta de usuarios
const USERS_QUERY_KEY = "users";

// Hook para obtener la lista de usuarios
export const useUsers = (): UseQueryResult<User[], Error> => {
  return useQuery<User[], Error>({
    queryKey: [USERS_QUERY_KEY],
    queryFn: getAllUsers,
    staleTime: 5 * 60 * 1000,
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
