import { Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "@modules/auth/hooks/useAuth";

/**
 * Loader simple para estados de transición
 */
const FullScreenLoader = () => (
  <Box
    sx={{
      display: "flex",
      height: "100vh",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress />
  </Box>
);

/**
 * Protege rutas privadas.
 */
export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullScreenLoader />;

  if (!isAuthenticated) {
    // Redirige al nuevo path de login
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

/**
 * Restringe rutas públicas (Login) si ya hay sesión.
 */
export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullScreenLoader />;

  if (isAuthenticated) {
    // Redirige a la página principal de la app
    return <Navigate to="/finance/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
