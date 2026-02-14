import { Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "@modules/auth/hooks/useAuth";
import { PERMISSION_REDIRECTS, UNAUTHORIZED } from "@core/api/appsApiRoute";

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
    return <Navigate to={PERMISSION_REDIRECTS.LOGIN} replace />;
  }

  return <Outlet />;
};

/**
 * Restringe rutas públicas (Login) si ya hay sesión.
 */
export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <FullScreenLoader />;

  if (isAuthenticated && user) {
    const applicationId = user.permissions?.[0]?.application_id;

    const redirectTo = PERMISSION_REDIRECTS[applicationId] ?? UNAUTHORIZED;

    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
