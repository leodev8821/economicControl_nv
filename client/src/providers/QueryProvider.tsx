import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// 1. Crea una instancia de QueryClient.
// Aquí puedes pasar opciones globales como reintentos, tiempo de vida de la caché, etc.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Por defecto, los datos son 'frescos' solo por 5 minutos (staleTime).
      // Después de 5 minutos, la siguiente vez que un componente pida este dato,
      // se mostrará la caché mientras se pide una nueva versión en segundo plano.
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: true, // Recargar datos al enfocar la pestaña (gran característica)
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => (
  // 2. Provee el cliente a toda la aplicación
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);