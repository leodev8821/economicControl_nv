import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  getAllIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} from "../api/incomeApi";
import type { Income } from "../types/income.type";
//import type { IncomeUpdateData } from "../api/incomeApi";
//import type { IncomeFormData } from "../schemas/income.schema";
import type {
  CreateIncomeDTO,
  UpdateIncomeDTO,
} from "@economic-control/shared";

// Definimos una clave única (queryKey) para esta consulta.
// React Query usa esta clave para almacenar en caché los datos.
const INCOMES_QUERY_KEY = "incomes";

/**
 * Hook personalizado para obtener la lista de ingresos (Incomes).
 * * ¿Cómo funciona useQuery?
 * 1. La primera vez que se llama en cualquier componente, ejecuta getAllIncomes().
 * 2. Guarda el resultado en caché bajo la clave 'incomes'.
 * 3. Si otro componente llama a useIncomes() en el futuro, React Query:
 * - Muestra inmediatamente los datos en caché (cero tiempo de carga).
 * - Comprueba si los datos están "stale" (caducados, por defecto 5 min).
 * - Si están stale, hace una petición en segundo plano para obtener la data fresca.
 * - Actualiza el componente si hay datos nuevos.
 * 4. Maneja los estados: isLoading, isError, error, data.
 * * @returns El resultado de la consulta de React Query (data, isLoading, isError, etc.).
 */
export const useIncomes = (): UseQueryResult<Income[], Error> => {
  return useQuery<Income[], Error>({
    queryKey: [INCOMES_QUERY_KEY],
    queryFn: getAllIncomes,
  });
};

/**
 * Hook personalizado para crear un nuevo ingreso.
 * @returns El resultado de la mutación (mutate, isLoading, isError, etc.).
 */
export const useCreateIncome = (): UseMutationResult<
  Income,
  Error,
  CreateIncomeDTO
  //IncomeFormData
> => {
  const queryClient = useQueryClient();

  //return useMutation<Income, Error, IncomeFormData>({
  return useMutation<Income, Error, CreateIncomeDTO>({
    mutationFn: createIncome, // Usa la función API de creación

    // Al tener éxito, invalida la caché de la lista de ingresos para forzar un re-fetch.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INCOMES_QUERY_KEY] });
    },
    // Opcional: Manejo de errores global.
    onError: (error: Error) => {
      console.error("Fallo la creación del ingreso:", error);
    },
  });
};

/**
 * Hook personalizado para actualizar un ingreso existente.
 * * En el onSuccess, invalida la caché de la lista para refrescar la tabla.
 * @returns El resultado de la mutación (mutate, isLoading, isError, etc.).
 */
export const useUpdateIncome = (): UseMutationResult<
  Income,
  Error,
  UpdateIncomeDTO
> => {
  const queryClient = useQueryClient();

  return useMutation<Income, Error, UpdateIncomeDTO>({
    mutationFn: updateIncome, // Usa la función API de actualización

    // Al tener éxito, invalida la caché
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INCOMES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la actualización del ingreso:", error);
    },
  });
};

/**
 * Hook personalizado para eliminar un ingreso existente.
 * * En el onSuccess, invalida la caché de la lista para refrescar la tabla.
 * @returns El resultado de la mutación (mutate, isLoading, isError, etc.).
 */
export const useDeleteIncome = (): UseMutationResult<Income, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation<Income, Error, number>({
    mutationFn: deleteIncome, // Usa la función API de eliminación

    // Al tener éxito, invalida la caché
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INCOMES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error("Fallo la eliminación del ingreso:", error);
    },
  });
};
