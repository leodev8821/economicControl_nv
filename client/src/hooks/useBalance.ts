import { useQuery } from '@tanstack/react-query';
import { getBalance } from '../api/dashboardApi';
import type { Balance } from '../types/balance';

/** Clave de consulta para React Query */
const BALANCE_QUERY_KEY = 'balanceData';

/**
 * Hook personalizado para obtener el balance del usuario.
 * @returns Un objeto con el estado de la consulta (data, isLoading, isError, error).
 */
export const useBalance = () => {
  return useQuery<Balance[], Error>({
    queryKey: [BALANCE_QUERY_KEY],
    queryFn: getBalance,
    // Puedes añadir opciones adicionales de React Query aquí, por ejemplo:
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};