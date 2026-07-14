import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  getAllIncomes,
  getOneIncome,
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
import type { IncomeCreationDTO } from "@economic-control/shared";

const INCOMES_QUERY_KEY = "incomes";

export const useIncomes = (): UseQueryResult<Income[], Error> => {
  return useQuery<Income[], Error>({
    queryKey: [INCOMES_QUERY_KEY],
    queryFn: getAllIncomes,
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

export const useOneIncome = (term: string | number): UseQueryResult<Income, Error> => {
  return useQuery<Income, Error>({
    queryKey: [INCOMES_QUERY_KEY, term],
    queryFn: () => getOneIncome(term),
    enabled: !!term,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateIncome = (): UseMutationResult<
  Income,
  Error,
  IncomeCreationDTO
> => {
  const queryClient = useQueryClient();

  return useMutation<Income, Error, IncomeCreationDTO>({
    mutationFn: createIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INCOMES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["cashes"] }); // Refresca las cajas
    },
    onError: (error: Error) => {
      console.error("Fallo la creación del ingreso:", error);
    },
  });
};

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
      queryClient.invalidateQueries({ queryKey: ["cashes"] }); // Refresca las cajas
    },
    onError: (error: Error) => {
      console.error("Fallo la creación masiva de ingresos:", error);
    },
  });
};

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
      queryClient.invalidateQueries({ queryKey: ["cashes"] }); // Refresca las cajas
    },
    onError: (error: Error) => {
      console.error("Fallo la actualización del ingreso:", error);
    },
  });
};

export const useDeleteIncome = (): UseMutationResult<boolean, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, number>({
    mutationFn: deleteIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INCOMES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["cashes"] }); // Refresca las cajas
    },
    onError: (error: Error) => {
      console.error("Fallo la eliminación del ingreso:", error);
    },
  });
};