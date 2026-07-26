import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { printConfigApi } from "@modules/cafeteria/api/print-configApi";
import { CafeteriaQueryKeys } from "@/core/api/queryKeys";
import type {
  PrintConfigType,
  PrintConfigUpdateDTO,
} from "@economic-control/shared";

// Hook para obtener la lista de configuración de impresións.
export const usePrintConfigs = (): UseQueryResult<PrintConfigType[], Error> => {
  return useQuery<PrintConfigType[], Error>({
    queryKey: CafeteriaQueryKeys.print_config.all(),
    queryFn: () => printConfigApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener un solo configuración de impresión
export const usePrintConfig = (id: number): UseQueryResult<PrintConfigType, Error> => {
  return useQuery<PrintConfigType, Error>({
    queryKey: CafeteriaQueryKeys.print_config.one(id),
    queryFn: () => printConfigApi.getById(id),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para actualizar un configuración de impresión.
export const useUpdatePrintConfig = (): UseMutationResult<
  PrintConfigType,
  Error,
  { id: number; data: PrintConfigUpdateDTO }
> => {
  const queryClient = useQueryClient();

  return useMutation<PrintConfigType, Error, { id: number; data: PrintConfigUpdateDTO }>({
    mutationFn: ({ id, data }: { id: number; data: PrintConfigUpdateDTO }) =>
      printConfigApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.print_config.one(id),
      });
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.print_config.all(),
      });
    },
  });
};
