import { apiSlice } from './apiSlice';
import type { IncomeAttributes, IncomeSource } from '../../types/models'; // 👈 Ajusta la ruta a tu archivo de modelos.
 // 👈 Ajusta la ruta a tu archivo de modelos.

// Interfaces que tipan la respuesta esperada de la API
interface Income extends IncomeAttributes {} // Usamos la interfaz del modelo

interface IncomesResponse {
    ok: boolean;
    message: string;
    data: Income[];
}

// Inyectar endpoints específicos de ingresos
export const incomeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Query para obtener todos los ingresos
    getIncomes: builder.query<IncomesResponse, void>({
      query: () => '/incomes', // La ruta completa será: BASE_URL/incomes
      // Proporciona el tag de caché 'Income' para esta query
      providesTags: (result) =>
        result
          ? [
              // Proporcionar un tag específico para cada ingreso para refetching granular
              ...result.data.map(({ id }) => ({ type: 'Income' as const, id })),
              { type: 'Income', id: 'LIST' }, // Tag para toda la lista
            ]
          : [{ type: 'Income', id: 'LIST' }], // Si la lista está vacía o hay error
    }),

    // Ejemplo de Mutation para crear un ingreso
    createIncome: builder.mutation<Income, Partial<Income>>({
        query: (newIncome) => ({
            url: '/incomes',
            method: 'POST',
            body: newIncome,
        }),
        // Invalida el tag 'LIST' después de crear, forzando la recarga de 'getIncomes'
        invalidatesTags: [{ type: 'Income', id: 'LIST' }], 
    }),
  }),
});

// Exportar el hook generado automáticamente
export const { useGetIncomesQuery, useCreateIncomeMutation } = incomeApi;