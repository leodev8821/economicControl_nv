import { useQuery } from "@tanstack/react-query";
import { getBalance } from "@modules/finance/api/dashboardApi";
import type { ApiResponse } from "@shared/types/apiResponse";
import type { CashBalance } from "@modules/finance/types/balance.type";

// Clave de consulta para React Query
const BALANCE_QUERY_KEY = "balanceData";

// Hook para obtener el balance del usuario.
export const useBalance = () => {
  return useQuery<ApiResponse<CashBalance>, Error>({
    queryKey: [BALANCE_QUERY_KEY],
    queryFn: getBalance,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
