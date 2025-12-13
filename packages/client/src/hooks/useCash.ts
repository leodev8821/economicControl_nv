import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  getAllCashes,
  createCash,
  updateCash,
  deleteCash,
  type CashUpdateData,
} from "../api/cashApi";
import type { Cash } from "../types/cash.type";
import type { CashCreationRequest } from "@economic-control/shared";

// Definimos una clave única (queryKey) para esta consulta.
// React Query usa esta clave para almacenar en caché los datos.
const CASH_QUERY_KEY = "cashes";

/**
 * Hook personalizado para obtener la lista de cajas (Cashes).
 * * ¿Cómo funciona useQuery?
 * 1. La primera vez que se llama en cualquier componente, ejecuta getAllCashes().
 * 2. Guarda el resultado en caché bajo la clave 'cashes'.
 * 3. Si otro componente llama a useCashes() en el futuro, React Query:
 * - Muestra inmediatamente los datos en caché (cero tiempo de carga).
 * - Comprueba si los datos están "stale" (caducados, por defecto 5 min).
 * - Si están stale, hace una petición en segundo plano para obtener la data fresca.
 * - Actualiza el componente si hay datos nuevos.
 * 4. Maneja los estados: isLoading, isError, error, data.
 * * @returns El resultado de la consulta de React Query (data, isLoading, isError, etc.).
 */
export const useCashes = (): UseQueryResult<Cash[], Error> => {
  return useQuery<Cash[], Error>({
    queryKey: [CASH_QUERY_KEY],
    queryFn: getAllCashes,
  });
};

/**
 * Hook personalizado para crear una nueva caja.
 * @returns El resultado de la mutación (mutate, isLoading, isError, etc.).
 */
export const useCreateCash = (): UseMutationResult<
  Cash,
  Error,
  CashCreationRequest
> => {
  const queryClient = useQueryClient();

  return useMutation<Cash, Error, CashCreationRequest>({
    mutationFn: createCash,

    // Al tener éxito, invalida la caché de la lista de cajas para forzar un re-fetch.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CASH_QUERY_KEY] });
    },
    // Opcional: Manejo de errores global.
    onError: (error: Error) => {
      console.error("Fallo la creación de la caja:", error);
    },
  });
};

/**
 * Hook personalizado para actualizar una caja existente.
 * * En el onSuccess, invalida la caché de la lista para refrescar la tabla.
 * @returns El resultado de la mutación (mutate, isLoading, isError, etc.).
 */
export const useUpdateCash = (): UseMutationResult<
  Cash,
  Error,
  CashUpdateData
> => {
  const queryClient = useQueryClient();

  return useMutation<Cash, Error, CashUpdateData>({
    mutationFn: updateCash,

    // Al tener éxito, invalida la caché
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CASH_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la actualización de la caja:", error);
    },
  });
};

/**
 * Hook personalizado para eliminar una caja existente.
 * * En el onSuccess, invalida la caché de la lista para refrescar la tabla.
 * @returns El resultado de la mutación (mutate, isLoading, isError, etc.).
 */
export const useDeleteCash = (): UseMutationResult<boolean, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, number>({
    mutationFn: deleteCash,

    // Al tener éxito, invalida la caché
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CASH_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la eliminación de la caja:", error);
    },
  });
};
