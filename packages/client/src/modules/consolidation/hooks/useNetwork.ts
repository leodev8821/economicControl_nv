import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  getAllNetworks,
  getOneNetwork,
  createNetwork,
  updateNetwork,
  deleteNetwork,
} from "@modules/consolidation/api/networkApi";
import type {
  NetworkAttributes,
  NetworkCreate,
  NetworkUpdate,
} from "@modules/consolidation/types/network.type";

// Clave única para esta consulta.
const NETWORKS_QUERY_KEY = "networks";

/**
 * Hook para obtener todas las redes.
 * @returns Un objeto UseQueryResult que contiene el resultado de la consulta.
 */
export const useReadNetworks = (): UseQueryResult<
  NetworkAttributes[],
  Error
> => {
  return useQuery<NetworkAttributes[], Error>({
    queryKey: [NETWORKS_QUERY_KEY],
    queryFn: getAllNetworks,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener una red por su ID.
 * @param id ID de la red.
 * @returns Un objeto UseQueryResult que contiene el resultado de la consulta.
 */
export const useOneNetwork = (
  id: number,
): UseQueryResult<NetworkAttributes, Error> => {
  return useQuery<NetworkAttributes, Error>({
    queryKey: [NETWORKS_QUERY_KEY, id],
    queryFn: () => getOneNetwork(id),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para crear una red.
 * @returns Un objeto UseMutationResult que contiene el resultado de la mutación.
 */
export const useCreateNetwork = (): UseMutationResult<
  NetworkAttributes,
  Error,
  NetworkCreate
> => {
  const queryClient = useQueryClient();

  return useMutation<NetworkAttributes, Error, NetworkCreate>({
    mutationFn: createNetwork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NETWORKS_QUERY_KEY] });
    },
  });
};

/**
 * Hook para actualizar una red.
 * @returns Un objeto UseMutationResult que contiene el resultado de la mutación.
 */
export const useUpdateNetwork = (): UseMutationResult<
  NetworkAttributes,
  Error,
  NetworkUpdate
> => {
  const queryClient = useQueryClient();

  return useMutation<NetworkAttributes, Error, NetworkUpdate>({
    mutationFn: updateNetwork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NETWORKS_QUERY_KEY] });
    },
  });
};

/**
 * Hook para eliminar una red.
 * @returns Un objeto UseMutationResult que contiene el resultado de la mutación.
 */
export const useDeleteNetwork = (): UseMutationResult<
  String,
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation<String, Error, number>({
    mutationFn: deleteNetwork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NETWORKS_QUERY_KEY] });
    },
  });
};
