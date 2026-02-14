import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@modules/auth/hooks/useAuth";
import { PERMISSION_REDIRECTS } from "@core/api/appsApiRoute";

interface RoleGuardProps {
  allowedRoles: string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  // Si no está logueado, al login
  if (!isAuthenticated)
    return <Navigate to={PERMISSION_REDIRECTS.LOGIN} replace />;

  // Si el rol del usuario no está en la lista de permitidos
  if (user && !allowedRoles.includes(user.role_name)) {
    // Redirigir a una página de "Acceso Denegado" o al dashboard principal
    return <Navigate to={PERMISSION_REDIRECTS.UNAUTHORIZED} replace />;
  }

  // Si todo está bien, renderiza la ruta hija
  return <Outlet />;
};
