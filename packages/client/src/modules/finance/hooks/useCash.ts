import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  getAllCashes,
  createCash,
  updateCash,
  deleteCash,
  type CashUpdateData,
} from "@modules/finance/api/cashApi";
import type { Cash } from "@modules/finance/types/cash.type";
import type { CashCreationRequest } from "@economic-control/shared";

// Clave única para esta consulta.
const CASH_QUERY_KEY = "cashes";

// Hook para obtener la lista de cajas.
export const useCashes = (): UseQueryResult<Cash[], Error> => {
  return useQuery<Cash[], Error>({
    queryKey: [CASH_QUERY_KEY],
    queryFn: getAllCashes,
  });
};

// Hook para crear una caja.
export const useCreateCash = (): UseMutationResult<
  Cash,
  Error,
  CashCreationRequest
> => {
  const queryClient = useQueryClient();

  return useMutation<Cash, Error, CashCreationRequest>({
    mutationFn: createCash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CASH_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la creación de la caja:", error);
    },
  });
};

// Hook para actualizar una caja.
export const useUpdateCash = (): UseMutationResult<
  Cash,
  Error,
  CashUpdateData
> => {
  const queryClient = useQueryClient();

  return useMutation<Cash, Error, CashUpdateData>({
    mutationFn: updateCash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CASH_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la actualización de la caja:", error);
    },
  });
};

// Hook para eliminar una caja.
export const useDeleteCash = (): UseMutationResult<boolean, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, number>({
    mutationFn: deleteCash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CASH_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la eliminación de la caja:", error);
    },
  });
};
