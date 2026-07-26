import { Navigate } from "react-router-dom";
import { useAuth } from "@modules/auth/hooks/useAuth";
import { APPS } from "@shared/constants/app";
import { PERMISSION_REDIRECTS } from "@core/api/appsApiRoute";

const EntryRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={`${PERMISSION_REDIRECTS.LOGIN}`} replace />;
  }

  // 🔱 SuperUser → AdminPage
  if (user.role_name === "SuperUser") {
    return <Navigate to={`${PERMISSION_REDIRECTS.ALL}`} replace />;
  }

  // 🔍 Permisos por aplicación

  const hasAllAccess = user.permissions.some(
    (p) => p.application_id === APPS.ALL,
  );

  const hasFinance = user.permissions.some(
    (p) => p.application_id === APPS.FINANCE,
  );

  const hasConsolidation = user.permissions.some(
    (p) => p.application_id === APPS.CONSOLIDATION,
  );

  const hasCafeteria = user.permissions.some(
    (p) => p.application_id === APPS.CAFETERIA,
  );

  // 📊 Prioridad Finance
  if (hasFinance || hasAllAccess) {
    return <Navigate to={`${PERMISSION_REDIRECTS.FINANCE}`} replace />;
  }

  // 📦 Consolidation
  if (hasConsolidation || hasAllAccess) {
    return <Navigate to={`${PERMISSION_REDIRECTS.CONSOLIDATION}`} replace />;
  }

  // ☕ Cafetería / POS
  if (hasCafeteria) {
    return <Navigate to={`${PERMISSION_REDIRECTS.CAFETERIA}`} replace />;
  }

  // ❌ Usuario sin apps asignadas
  return <Navigate to={`${PERMISSION_REDIRECTS.LOGIN}`} replace />;
};

export default EntryRoute;
