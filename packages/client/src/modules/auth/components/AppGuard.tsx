import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@modules/auth/hooks/useAuth";
import { APPS } from "@shared/constants/app";

interface AppGuardProps {
  requiredAppId: number;
}

export const AppGuard: React.FC<AppGuardProps> = ({ requiredAppId }) => {
  const { user, isAuthenticated } = useAuth();

  // 🔒 No autenticado
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // ⏳ Usuario aún no cargado
  if (!user) {
    return null; // o un loader si quieres
  }

  // 🔐 Validación de acceso por aplicación
  const hasAccess = user.permissions.some(
    (p) => p.application_id === requiredAppId || p.application_id === APPS.ALL,
  );

  if (!hasAccess) {
    console.warn(
      `Acceso denegado a App ${requiredAppId}. Permisos:`,
      user.permissions,
    );
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
