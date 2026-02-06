import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  getAllIncomes,
  createIncome,
  createBulkIncome,
  updateIncome,
  deleteIncome,
  type IncomeUpdateData,
} from "@modules/finance/api/incomeApi";
import type {
  BulkIncomeCreatePayload,
  Income,
} from "@modules/finance/types/income.type";
import type { IncomeCreationRequest } from "@economic-control/shared";

// Clave única para esta consulta.
const INCOMES_QUERY_KEY = "incomes";

// Hook para obtener la lista de ingresos.
export const useReadIncomes = (): UseQueryResult<Income[], Error> => {
  return useQuery<Income[], Error>({
    queryKey: [INCOMES_QUERY_KEY],
    queryFn: getAllIncomes,
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

// Hook personalizado para crear un nuevo ingreso.
export const useCreateIncome = (): UseMutationResult<
  Income,
  Error,
  IncomeCreationRequest
> => {
  const queryClient = useQueryClient();

  return useMutation<Income, Error, IncomeCreationRequest>({
    mutationFn: createIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INCOMES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la creación del ingreso:", error);
    },
  });
};

// Hook personalizado para crear varios ingresos a la vez.
export const useCreateBulkIncome = (): UseMutationResult<
  Income[],
  Error,
  BulkIncomeCreatePayload
> => {
  const queryClient = useQueryClient();

  return useMutation<Income[], Error, BulkIncomeCreatePayload>({
    mutationFn: createBulkIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INCOMES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["cashes"] });
    },
    onError: (error: Error) => {
      console.error("Fallo la creación masiva de ingresos:", error);
    },
  });
};

// Hook personalizado para actualizar un ingreso existente.
export const useUpdateIncome = (): UseMutationResult<
  Income,
  Error,
  IncomeUpdateData
> => {
  const queryClient = useQueryClient();

  return useMutation<Income, Error, IncomeUpdateData>({
    mutationFn: updateIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INCOMES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la actualización del ingreso:", error);
    },
  });
};

// Hook personalizado para eliminar un ingreso existente.
export const useDeleteIncome = (): UseMutationResult<Income, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation<Income, Error, number>({
    mutationFn: deleteIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INCOMES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la eliminación del ingreso:", error);
    },
  });
};
