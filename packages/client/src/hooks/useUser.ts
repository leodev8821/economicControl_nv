import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../api/userApi";
import type { User, UserAttributes } from "../types/user.type";
import type { UserCreationRequest } from "@economic-control/shared";

// Definimos una clave única (queryKey) para esta consulta.
// React Query usa esta clave para almacenar en caché los datos.
const USERS_QUERY_KEY = "users";

/**
 * Hook personalizado para obtener la lista de usuarios (Users).
 * * ¿Cómo funciona useQuery?
 * 1. La primera vez que se llama en cualquier componente, ejecuta getAllUsers().
 * 2. Guarda el resultado en caché bajo la clave 'persons'.
 * 3. Si otro componente llama a usePersons() en el futuro, React Query:
 * - Muestra inmediatamente los datos en caché (cero tiempo de carga).
 * - Comprueba si los datos están "stale" (caducados, por defecto 5 min).
 * - Si están stale, hace una petición en segundo plano para obtener la data fresca.
 * - Actualiza el componente si hay datos nuevos.
 * 4. Maneja los estados: isLoading, isError, error, data.
 * * @returns El resultado de la consulta de React Query (data, isLoading, isError, etc.).
 */
export const useUsers = (): UseQueryResult<User[], Error> => {
  return useQuery<User[], Error>({
    queryKey: [USERS_QUERY_KEY],
    queryFn: getAllUsers,
    staleTime: 5 * 60 * 1000,
  });
};

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

export const useDeleteUser = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
};
