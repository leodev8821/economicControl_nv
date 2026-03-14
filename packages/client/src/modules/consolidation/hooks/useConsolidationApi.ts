import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { consolidationApi } from "@modules/consolidation/api/consolidationApi";
import { ConsolidationQueryKeys } from "@/core/api/queryKeys";
import type {
  ConsolidationType,
  ConsolidationCreationDTO,
  BulkConsolidationCreationDTO,
  ConsolidationUpdateDTO,
} from "@economic-control/shared";

// 🔹 Obtener todas las consolidaciones
export const useConsolidations = (): UseQueryResult<
  ConsolidationType[],
  Error
> => {
  return useQuery<ConsolidationType[], Error>({
    queryKey: ConsolidationQueryKeys.consolidations.all(),
    queryFn: () => consolidationApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

// 🔹 Obtener una consolidación por ID
export const useConsolidation = (
  id: number,
): UseQueryResult<ConsolidationType, Error> => {
  return useQuery<ConsolidationType, Error>({
    queryKey: ConsolidationQueryKeys.consolidations.one(id),
    queryFn: () => consolidationApi.getById(id),
    staleTime: 5 * 60 * 1000,
  });
};

// 🔹 Crear una consolidación
export const useCreateConsolidation = (): UseMutationResult<
  ConsolidationType,
  Error,
  ConsolidationCreationDTO
> => {
  const queryClient = useQueryClient();
  return useMutation<ConsolidationType, Error, ConsolidationCreationDTO>({
    mutationFn: (data: ConsolidationCreationDTO) =>
      consolidationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.consolidations.all(),
      });
    },
  });
};

// 🔹 Crear múltiples consolidaciones
export const useCreateBulkConsolidations = (): UseMutationResult<
  ConsolidationType[],
  Error,
  BulkConsolidationCreationDTO[]
> => {
  const queryClient = useQueryClient();
  return useMutation<
    ConsolidationType[],
    Error,
    BulkConsolidationCreationDTO[]
  >({
    mutationFn: (data: BulkConsolidationCreationDTO[]) =>
      consolidationApi.createBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.consolidations.all(),
      });
    },
  });
};

// 🔹 Actualizar una consolidación
export const useUpdateConsolidation = (): UseMutationResult<
  ConsolidationType,
  Error,
  { id: number; data: ConsolidationUpdateDTO }
> => {
  const queryClient = useQueryClient();
  return useMutation<
    ConsolidationType,
    Error,
    { id: number; data: ConsolidationUpdateDTO }
  >({
    mutationFn: ({ id, data }: { id: number; data: ConsolidationUpdateDTO }) =>
      consolidationApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.consolidations.one(id),
      });
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.consolidations.all(),
      });
    },
  });
};

// 🔹 Eliminar una consolidación
export const useDeleteConsolidation = (): UseMutationResult<
  { message: string },
  Error,
  { id: number }
> => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, { id: number }>({
    mutationFn: ({ id }: { id: number }) => consolidationApi.remove(id),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.consolidations.one(id),
      });
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.consolidations.all(),
      });
    },
  });
};
