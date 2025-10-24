/**
 * Define la estructura estándar de respuesta de tu API REST.
 *
 * T: Es un parámetro de tipo que representa el tipo de los elementos
 * contenidos en el array 'data'.
 */
export interface ApiResponse<T> {
  ok: boolean;
  message?: string;
  data: T[];
}

// Tipo auxiliar para manejar respuestas que pueden ser single o array
export interface ApiResponseData<T> {
    ok: boolean;
    message?: string;
    data: T;
};