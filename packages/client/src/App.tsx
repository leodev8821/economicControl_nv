import { AuthProvider } from "@modules/auth/context/AuthProvider";
import { AppRouter } from "@core/routes/AppRouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Configuración de React Query (opcional pero recomendada)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
