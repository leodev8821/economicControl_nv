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

/**
 * Hook para obtener la configuración de impresión (Singleton).
 * Aunque la API se genere con createCrudApi, el backend devuelve
 * un único objeto (PrintConfigType) y no un array de resultados.
 */
export const usePrintConfig = (): UseQueryResult<PrintConfigType, Error> => {
  return useQuery<PrintConfigType, Error>({
    queryKey: CafeteriaQueryKeys.print_config.all(),
    // Forzamos el tipado porque createCrudApi.getAll() típicamente devuelve T[],
    // pero nuestro servicio backend lo trata como Singleton devolviendo T.
    queryFn: () => printConfigApi.getAll() as unknown as Promise<PrintConfigType>,
    staleTime: 5 * 60 * 1000, // Caché de 5 minutos
  });
};

/**
 * Hook para actualizar la configuración de impresión.
 * El backend (updateConfig) actualiza el primer registro que encuentra 
 * ignorando un posible ID en el parámetro, pero mantenemos el ID en la mutación
 * para satisfacer la firma estándar de createCrudApi.
 */
export const useUpdatePrintConfig = (): UseMutationResult<
  PrintConfigType,
  Error,
  { id: number; data: PrintConfigUpdateDTO }
> => {
  const queryClient = useQueryClient();

  return useMutation<PrintConfigType, Error, { id: number; data: PrintConfigUpdateDTO }>({
    mutationFn: ({ id, data }: { id: number; data: PrintConfigUpdateDTO }) =>
      printConfigApi.update(id, data),
    onSuccess: () => {
      // Invalidamos la llave global para refrescar los datos en pantalla
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.print_config.all(),
      });
    },
  });
};