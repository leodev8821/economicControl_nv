import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  getAllCashDenominations,
  getCashDenominationsByCashId,
  updateCashDenomination,
  type CashDenominationUpdateData,
} from "@modules/finance/api/cash-denominationApi";
import type { CashDenomination } from "@modules/finance/types/cash-denomination.type";

// Clave única para esta consulta.
const CASH_DENOMINATIONS_QUERY_KEY = "cash-denominations";

// Hook para obtener el listado de denominaciones (Billetes y Monedas).
export const useReadCashDenominations = (
  cashId?: number,
): UseQueryResult<CashDenomination[], Error> => {
  return useQuery<CashDenomination[], Error>({
    queryKey: [CASH_DENOMINATIONS_QUERY_KEY, cashId],
    queryFn: () =>
      cashId ? getCashDenominationsByCashId(cashId) : getAllCashDenominations(),
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

// Hook personalizado para actualizar una denominación.
export const useUpdateCashDenomination = (): UseMutationResult<
  CashDenomination,
  Error,
  CashDenominationUpdateData
> => {
  const queryClient = useQueryClient();

  return useMutation<CashDenomination, Error, CashDenominationUpdateData>({
    mutationFn: updateCashDenomination,
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
