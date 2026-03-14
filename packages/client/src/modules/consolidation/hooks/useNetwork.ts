import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { networkApi } from "@modules/consolidation/api/networkApi";
import { ConsolidationQueryKeys } from "@/core/api/queryKeys";
import type {
  NetworkType,
  NetworkCreationDTO,
  NetworkUpdateDTO,
} from "@economic-control/shared";

// 🔹 Obtener todas las redes
export const useNetworks = (): UseQueryResult<NetworkType[], Error> => {
  return useQuery<NetworkType[], Error>({
    queryKey: ConsolidationQueryKeys.networks.all(),
    queryFn: () => networkApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

// 🔹 Obtener una red por ID
export const useNetwork = (id: number): UseQueryResult<NetworkType, Error> => {
  return useQuery<NetworkType, Error>({
    queryKey: ConsolidationQueryKeys.networks.one(id),
    queryFn: () => networkApi.getById(id),
    staleTime: 5 * 60 * 1000,
  });
};

// 🔹 Crear una red
export const useCreateNetwork = (): UseMutationResult<
  NetworkType,
  Error,
  NetworkCreationDTO
> => {
  const queryClient = useQueryClient();
  return useMutation<NetworkType, Error, NetworkCreationDTO>({
    mutationFn: (data: NetworkCreationDTO) => networkApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.networks.all(),
      });
    },
  });
};

// 🔹 Actualizar una red
export const useUpdateNetwork = (): UseMutationResult<
  NetworkType,
  Error,
  { id: number; data: NetworkUpdateDTO }
> => {
  const queryClient = useQueryClient();
  return useMutation<
    NetworkType,
    Error,
    { id: number; data: NetworkUpdateDTO }
  >({
    mutationFn: ({ id, data }: { id: number; data: NetworkUpdateDTO }) =>
      networkApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.networks.one(id),
      });
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.networks.all(),
      });
    },
  });
};

// 🔹 Eliminar una red
export const useDeleteNetwork = (): UseMutationResult<
  { message: string },
  Error,
  { id: number }
> => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, { id: number }>({
    mutationFn: ({ id }: { id: number }) => networkApi.remove(id),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.networks.one(id),
      });
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.networks.all(),
      });
    },
  });
};
