import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@modules/auth/hooks/useAuth";
import { PERMISSION_REDIRECTS } from "@/core/api/appsApiRoute";
import { Box, CircularProgress } from "@mui/material";

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

interface AppGuardProps {
  requiredAppIds: number[];
}

export const AppGuard: React.FC<AppGuardProps> = ({ requiredAppIds }) => {
  const { user } = useAuth();

  // ⏳ Usuario aún no cargado
  if (!user) {
    return <FullScreenLoader />;
  }

  const permissions = user.permissions ?? [];

  // 🔐 Validación de acceso por aplicación
  const hasAccess = permissions.some((p) =>
    requiredAppIds.includes(p.application_id),
  );

  if (!hasAccess) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `Acceso denegado a App ${requiredAppIds}. Permisos:`,
        permissions,
      );
    }
    return <Navigate to={PERMISSION_REDIRECTS.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};
