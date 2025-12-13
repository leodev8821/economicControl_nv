import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  createOutcome,
  getAllOutcomes,
  updateOutcome,
  deleteOutcome,
  type OutcomeUpdateData,
} from "../api/outcomeApi";
import type { Outcome } from "../types/outcome.type";
import type { OutcomeCreationRequest } from "@economic-control/shared";

// Definimos una clave única (queryKey) para esta consulta.
// React Query usa esta clave para almacenar en caché los datos.
const OUTCOMES_QUERY_KEY = "outcomes";

/**
 * Hook personalizado para obtener la lista de egresos (Outcomes).
 * * ¿Cómo funciona useQuery?
 * 1. La primera vez que se llama en cualquier componente, ejecuta getAllOutcomes().
 * 2. Guarda el resultado en caché bajo la clave 'outcomes'.
 * 3. Si otro componente llama a useOutcomes() en el futuro, React Query:
 * - Muestra inmediatamente los datos en caché (cero tiempo de carga).
 * - Comprueba si los datos están "stale" (caducados, por defecto 5 min).
 * - Si están stale, hace una petición en segundo plano para obtener la data fresca.
 * - Actualiza el componente si hay datos nuevos.
 * 4. Maneja los estados: isLoading, isError, error, data.
 * * @returns El resultado de la consulta de React Query (data, isLoading, isError, etc.).
 */
export const useReadOutcomes = (): UseQueryResult<Outcome[], Error> => {
  return useQuery<Outcome[], Error>({
    queryKey: [OUTCOMES_QUERY_KEY],
    queryFn: getAllOutcomes,
  });
};

/**
 * Hook personalizado para crear un nuevo egreso.
 * @returns El resultado de la mutación (mutate, isLoading, isError, etc.).
 */
export const useCreateOutcome = (): UseMutationResult<
  Outcome,
  Error,
  OutcomeCreationRequest
  //IncomeFormData
> => {
  const queryClient = useQueryClient();

  //return useMutation<Income, Error, IncomeFormData>({
  return useMutation<Outcome, Error, OutcomeCreationRequest>({
    mutationFn: createOutcome, // Usa la función API de creación

    // Al tener éxito, invalida la caché de la lista de ingresos para forzar un re-fetch.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OUTCOMES_QUERY_KEY] });
    },
    // Opcional: Manejo de errores global.
    onError: (error: Error) => {
      console.error("Fallo la creación del ingreso:", error);
    },
  });
};

/**
 * Hook personalizado para actualizar un egreso existente.
 * * En el onSuccess, invalida la caché de la lista para refrescar la tabla.
 * @returns El resultado de la mutación (mutate, isLoading, isError, etc.).
 */
export const useUpdateOutcome = (): UseMutationResult<
  Outcome,
  Error,
  OutcomeUpdateData
> => {
  const queryClient = useQueryClient();

  return useMutation<Outcome, Error, OutcomeUpdateData>({
    mutationFn: updateOutcome, // Usa la función API de actualización

    // Al tener éxito, invalida la caché
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OUTCOMES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la actualización del ingreso:", error);
    },
  });
};

/**
 * Hook personalizado para eliminar un egreso existente.
 * * En el onSuccess, invalida la caché de la lista para refrescar la tabla.
 * @returns El resultado de la mutación (mutate, isLoading, isError, etc.).
 */
export const useDeleteOutcome = (): UseMutationResult<
  Outcome,
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation<Outcome, Error, number>({
    mutationFn: deleteOutcome, // Usa la función API de eliminación

    // Al tener éxito, invalida la caché
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OUTCOMES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la eliminación del ingreso:", error);
    },
  });
};
