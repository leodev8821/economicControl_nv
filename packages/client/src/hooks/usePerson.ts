import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { getAllPersons } from "../api/personApi";
import type { Person } from "../types/person.type";

// Definimos una clave única (queryKey) para esta consulta.
// React Query usa esta clave para almacenar en caché los datos.
const PERSONS_QUERY_KEY = "persons";

/**
 * Hook personalizado para obtener la lista de personas (Persons).
 * * ¿Cómo funciona useQuery?
 * 1. La primera vez que se llama en cualquier componente, ejecuta getAllPersons().
 * 2. Guarda el resultado en caché bajo la clave 'persons'.
 * 3. Si otro componente llama a usePersons() en el futuro, React Query:
 * - Muestra inmediatamente los datos en caché (cero tiempo de carga).
 * - Comprueba si los datos están "stale" (caducados, por defecto 5 min).
 * - Si están stale, hace una petición en segundo plano para obtener la data fresca.
 * - Actualiza el componente si hay datos nuevos.
 * 4. Maneja los estados: isLoading, isError, error, data.
 * * @returns El resultado de la consulta de React Query (data, isLoading, isError, etc.).
 */
export const usePersons = (): UseQueryResult<Person[], Error> => {
  return useQuery<Person[], Error>({
    queryKey: [PERSONS_QUERY_KEY],
    queryFn: getAllPersons,
  });
};
