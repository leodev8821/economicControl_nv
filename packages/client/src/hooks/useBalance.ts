import { useQuery } from "@tanstack/react-query";
import { getBalance } from "../api/dashboardApi";
import type { ApiResponse } from "../types/apiResponse";
import type { CashBalance } from "../types/balance.type";

/** Clave de consulta para React Query */
const BALANCE_QUERY_KEY = "balanceData";

/**
 * Hook personalizado para obtener el balance del usuario.
 * @returns Un objeto con el estado de la consulta (data, isLoading, isError, error).
 */
export const useBalance = () => {
  return useQuery<ApiResponse<CashBalance>, Error>({
    queryKey: [BALANCE_QUERY_KEY],
    queryFn: getBalance,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
