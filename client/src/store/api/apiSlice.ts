import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// URL base de tu backend (ajusta el puerto si es diferente)
const BASE_URL = 'http://localhost:3000/ec/api/v1';

// 💡 apiSlice es tu única fuente de verdad para interactuar con el backend
export const apiSlice = createApi({
  // Nombre único para el reducer del slice
  reducerPath: 'api', 
  // Función para obtener la URL base y configurar headers, etc.
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  // Definir los tags de caché para invalidación de datos
  tagTypes: ['Income', 'Outcome', 'Person', 'Week'], 
  // endpoints: serán inyectados por otros archivos (ej. incomeApi.ts)
  endpoints: (builder) => ({}),
});