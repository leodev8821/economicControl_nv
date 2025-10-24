import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { getAllWeeks } from '../api/weekApi';
import type { Week } from '../types/week'; 

// Definimos una clave única (queryKey) para esta consulta.
// React Query usa esta clave para almacenar en caché los datos.
const WEEKS_QUERY_KEY = 'weeks';

/**
 * Hook personalizado para obtener la lista de semanas (Weeks).
 * * ¿Cómo funciona useQuery?
 * 1. La primera vez que se llama en cualquier componente, ejecuta getAllWeeks().
 * 2. Guarda el resultado en caché bajo la clave 'weeks'.
 * 3. Si otro componente llama a useWeeks() en el futuro, React Query:
 * - Muestra inmediatamente los datos en caché (cero tiempo de carga).
 * - Comprueba si los datos están "stale" (caducados, por defecto 5 min).
 * - Si están stale, hace una petición en segundo plano para obtener la data fresca.
 * - Actualiza el componente si hay datos nuevos.
 * 4. Maneja los estados: isLoading, isError, error, data.
 * * @returns El resultado de la consulta de React Query (data, isLoading, isError, etc.).
 */
export const useWeeks = (): UseQueryResult<Week[], Error> => {
  return useQuery<Week[], Error>({
    queryKey: [WEEKS_QUERY_KEY], 
    queryFn: getAllWeeks,
  });
};