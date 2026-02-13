import { Navigate } from "react-router-dom";
import { useAuth } from "@modules/auth/hooks/useAuth";
import { APPS } from "@shared/constants/app";

const EntryRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // 🔱 SuperUser → AdminPage
  if (user.role_name === "SuperUser") {
    return <Navigate to="/admin/home" replace />;
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

  // 📊 Prioridad Finance
  if (hasFinance || hasAllAccess) {
    return <Navigate to="/finance/dashboard" replace />;
  }

  // 📦 Consolidation
  if (hasConsolidation || hasAllAccess) {
    return <Navigate to="/consolidation/home" replace />;
  }

  // ❌ Usuario sin apps asignadas
  return <Navigate to="/auth/login" replace />;
};

export default EntryRoute;
