import { useQuery } from "@tanstack/react-query";
import { getBalance } from "@modules/finance/api/dashboardApi";
import type { ApiResponse } from "@shared/types/apiResponse";
import type {
  CashBalance,
  BalanceFilters,
} from "@modules/finance/types/balance.type";

// Clave de consulta base
export const BALANCE_QUERY_KEY = "balanceData";

/**
 * Hook para obtener el balance con soporte de filtros.
 * @param filters Objeto opcional con week_id o rango de fechas.
 */
export const useBalance = (filters: BalanceFilters = {}) => {
  return useQuery<ApiResponse<CashBalance>, Error>({
    // La queryKey ahora incluye los filtros.
    // Si filters.week_id cambia, React Query re-ejecuta queryFn.
    queryKey: [BALANCE_QUERY_KEY, filters],

    // Pasamos los filtros a la función de la API
    queryFn: () => getBalance(filters),

    staleTime: 1000 * 60 * 5, // 5 minutos

    // Opcional: Evita peticiones si se activó el modo semana pero no hay ID seleccionado
    //enabled: filters.week_id !== undefined || !filters.isFilteringByWeek
  });
};
