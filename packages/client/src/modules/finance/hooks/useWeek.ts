import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { getAllWeeks } from "@modules/finance/api/weekApi";
import type { Week } from "@modules/finance/types/week.type";

// Clave única para esta consulta.
const WEEKS_QUERY_KEY = "weeks";

// Hook personalizado para obtener la lista de semanas (Weeks).
export const useWeeks = (): UseQueryResult<Week[], Error> => {
  return useQuery<Week[], Error>({
    queryKey: [WEEKS_QUERY_KEY],
    queryFn: getAllWeeks,
  });
};
