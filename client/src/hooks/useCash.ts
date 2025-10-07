import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { getAllCashes } from '../api/cashApi';
import type { Cash } from '../types/cash'; 

// Definimos una clave única (queryKey) para esta consulta.
// React Query usa esta clave para almacenar en caché los datos.
const CASH_QUERY_KEY = 'cashes';

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