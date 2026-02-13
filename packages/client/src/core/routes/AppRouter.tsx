import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// 1. Layouts y Protección
import AppLayout from "@shared/components/layout/AppLayout";
import ProtectedRoute from "@modules/auth/components/ProtectedRoute";
import { AppGuard } from "@/modules/auth/components/AppGuard";
import { RoleGuard } from "@/modules/auth/components/RoleGuard";
import { APPS } from "@shared/constants/app";
import EntryRoute from "./EntryRoute";

// 2. Componentes de Carga (Lazy Loading)

// --- SHARED MODULE ---
const AdminPage = lazy(() => import("@shared/components/pages/AdminPage"));

// --- AUTH MODULE ---
const SignIn = lazy(() => import("@modules/auth/pages/SignIn"));
const UsersPage = lazy(() => import("@modules/auth/pages/UsersPage"));

// --- FINANCE MODULE ---
const DashboardPage = lazy(
  () => import("@modules/finance/pages/DashboardPage"),
);
const CashesPage = lazy(() => import("@modules/finance/pages/CashesPage"));
const IncomesPage = lazy(() => import("@modules/finance/pages/IncomesPage"));
const OutcomesPage = lazy(() => import("@modules/finance/pages/OutcomesPage"));
const PersonsPage = lazy(() => import("@modules/finance/pages/PersonsPage"));
const CashDenominationPage = lazy(
  () => import("@modules/finance/pages/CashDenominationPage"),
);

// Nota: Asegúrate de crear WeeksPage.tsx en modules/finance/pages si aún no existe,
// ya que tenemos weekApi.ts funcionando.
//const WeeksPage = lazy(() => import("@modules/finance/pages/WeeksPage"));

// --- CONSOLIDATION MODULE (Placeholders) ---
const ConsolidationPage = lazy(
  () => import("@modules/consolidation/pages/ConsolidationPage"),
);

// 3. Loader Global
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen w-full bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

export const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* =================================================================
            🔓 RUTAS PÚBLICAS
           ================================================================= */}
        <Route path="/auth/login" element={<SignIn />} />

        {/* Redirección EntryRoute*/}
        <Route path="/" element={<EntryRoute />} />

        {/* =================================================================
            🔒 RUTAS PRIVADAS (Layout Principal)
           ================================================================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* ADMIN */}
            <Route element={<RoleGuard allowedRoles={["SuperUser"]} />}>
              <Route path="/admin/home" element={<AdminPage />} />
            </Route>

            {/* SECCIÓN FINANCE (Solo para quienes tengan el permiso en la tabla pivot) */}
            <Route
              element={<AppGuard requiredAppId={APPS.FINANCE || APPS.ALL} />}
            >
              <Route path="/finance/dashboard" element={<DashboardPage />} />
              <Route path="/finance/cashes" element={<CashesPage />} />
              <Route path="/finance/incomes" element={<IncomesPage />} />
              <Route path="/finance/outcomes" element={<OutcomesPage />} />
              <Route path="/finance/persons" element={<PersonsPage />} />
              <Route
                path="/finance/cash-denominations"
                element={<CashDenominationPage />}
              />

              {/* Sub-protección: Solo Admin/SuperUser dentro de Finance */}
              <Route
                element={
                  <RoleGuard allowedRoles={["Administrador", "SuperUser"]} />
                }
              >
                <Route path="/admin/users" element={<UsersPage />} />
              </Route>
            </Route>

            {/* SECCIÓN CONSOLIDATION */}
            <Route
              element={
                <AppGuard requiredAppId={APPS.CONSOLIDATION || APPS.ALL} />
              }
            >
              <Route
                path="/consolidation/home"
                element={<ConsolidationPage />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};
