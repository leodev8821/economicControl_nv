import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { getAllWeeks } from "@modules/finance/api/weekApi";
import type { Week } from "@modules/finance/types/week.type";
import type { ApiResponse } from "@shared/types/apiResponse";

// Clave única para esta consulta.
const WEEKS_QUERY_KEY = "weeks";

/**
 * Hook personalizado para obtener la lista de semanas (Weeks).
 * Se espera que getAllWeeks retorne un objeto tipo ApiResponse<Week[]>
 */
export const useWeeks = (): UseQueryResult<ApiResponse<Week>, Error> => {
  return useQuery<ApiResponse<Week>, Error>({
    queryKey: [WEEKS_QUERY_KEY],
    queryFn: getAllWeeks,
    // Las semanas no cambian constantemente, añadimos un staleTime
    staleTime: 1000 * 60 * 60, // 1 hora de caché
    // Opcional: ordenar las semanas de la más reciente a la más antigua
    select: (response) => ({
      ...response,
      data: [...response.data].sort((a, b) => b.id - a.id),
    }),
  });
};
