import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  createOutcome,
  createBulkOutcome,
  getAllOutcomes,
  updateOutcome,
  deleteOutcome,
  type OutcomeUpdateData,
} from "@modules/finance/api/outcomeApi";
import type {
  Outcome,
  BulkOutcomeCreatePayload,
} from "@modules/finance/types/outcome.type";
import type { OutcomeCreationRequest } from "@economic-control/shared";

// Clave única para esta consulta.
const OUTCOMES_QUERY_KEY = "outcomes";

// Hook para obtener la lista de egresos.
export const useReadOutcomes = (): UseQueryResult<Outcome[], Error> => {
  return useQuery<Outcome[], Error>({
    queryKey: [OUTCOMES_QUERY_KEY],
    queryFn: getAllOutcomes,
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

// Hook para crear un nuevo egreso.
export const useCreateOutcome = (): UseMutationResult<
  Outcome,
  Error,
  OutcomeCreationRequest
  //IncomeFormData
> => {
  const queryClient = useQueryClient();

  //return useMutation<Income, Error, IncomeFormData>({
  return useMutation<Outcome, Error, OutcomeCreationRequest>({
    mutationFn: createOutcome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OUTCOMES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la creación del ingreso:", error);
    },
  });
};

// Hook para crear varios egresos a la vez.
export const useCreateBulkOutcome = (): UseMutationResult<
  Outcome[],
  Error,
  BulkOutcomeCreatePayload
> => {
  const queryClient = useQueryClient();

  return useMutation<Outcome[], Error, BulkOutcomeCreatePayload>({
    mutationFn: createBulkOutcome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OUTCOMES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["cashes"] });
    },
    onError: (error: Error) => {
      console.error("Fallo la creación masiva de ingresos:", error);
    },
  });
};

// Hook para actualizar un egreso existente.
export const useUpdateOutcome = (): UseMutationResult<
  Outcome,
  Error,
  OutcomeUpdateData
> => {
  const queryClient = useQueryClient();

  return useMutation<Outcome, Error, OutcomeUpdateData>({
    mutationFn: updateOutcome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OUTCOMES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la actualización del ingreso:", error);
    },
  });
};

// Hook para eliminar un egreso existente.
export const useDeleteOutcome = (): UseMutationResult<
  Outcome,
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation<Outcome, Error, number>({
    mutationFn: deleteOutcome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OUTCOMES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la eliminación del ingreso:", error);
    },
  });
};
