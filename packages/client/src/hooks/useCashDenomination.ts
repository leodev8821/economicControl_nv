import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  getAllCashDenominations,
  updateCashDenomination,
  type CashDenominationUpdateData,
} from "../api/cash-denominationApi";
import type { CashDenomination } from "../types/cash-denomination.type";

const CASH_DENOMINATIONS_QUERY_KEY = "cash-denominations";

/**
 * Hook para obtener el listado de denominaciones (Billetes y Monedas).
 */
export const useReadCashDenominations = (): UseQueryResult<
  CashDenomination[],
  Error
> => {
  return useQuery<CashDenomination[], Error>({
    queryKey: [CASH_DENOMINATIONS_QUERY_KEY],
    queryFn: getAllCashDenominations,
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

/**
 * Hook personalizado para actualizar una denominación.
 * * En el onSuccess, invalida la caché de la lista para refrescar la tabla.
 * @returns El resultado de la mutación (mutate, isLoading, isError, etc.).
 */
export const useUpdateCashDenomination = (): UseMutationResult<
  CashDenomination,
  Error,
  CashDenominationUpdateData
> => {
  const queryClient = useQueryClient();

  return useMutation<CashDenomination, Error, CashDenominationUpdateData>({
    mutationFn: updateCashDenomination, // Usa la función API de actualización

    // Al tener éxito, invalida la caché
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CASH_DENOMINATIONS_QUERY_KEY],
      });
    },
    onError: (error: Error) => {
      console.error("Fallo la actualización de la denominación:", error);
    },
  });
};
