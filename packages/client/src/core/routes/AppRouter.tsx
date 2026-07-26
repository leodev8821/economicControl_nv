import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// 1. Layouts y Protección
import AppLayout from "@shared/components/layout/AppLayout";
import ProtectedRoute from "@modules/auth/components/ProtectedRoute";
import { AppGuard } from "@/modules/auth/components/AppGuard";
import { RoleGuard } from "@/modules/auth/components/RoleGuard";
import { APPS } from "@shared/constants/app";
import { API_ROUTES_PATH } from "@core/api/appsApiRoute";
import EntryRoute from "./EntryRoute";
import BillsPage from "@/modules/cafeteria/pages/BillsPage";
import ProductsPage from "@/modules/cafeteria/pages/ProductsPage";

// 2. Componentes de Carga (Lazy Loading)

// --- SHARED MODULE ---
const AdminPage = lazy(() => import("@shared/components/pages/AdminPage"));

// --- AUTH MODULE ---
const SignIn = lazy(() => import("@modules/auth/pages/SignIn"));
const UsersPage = lazy(() => import("@modules/auth/pages/UsersPage"));
const ForgotPasswordPage = lazy(
  () => import("@modules/auth/pages/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(
  () => import("@modules/auth/pages/ResetPasswordPage"),
);

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

// --- CONSOLIDATION MODULE ---
const MembersPage = lazy(
  () => import("@modules/consolidation/pages/MemberPage"),
);

// --- CAFETERIA / POS MODULE ---
const POSPage = lazy(() => import("@modules/cafeteria/pages/POSPage"));

// --- NOT FOUND MODULE ---
const ModulePlaceholder = lazy(
  () => import("@shared/components/pages/ModulePlaceholder"),
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
        <Route path={`${API_ROUTES_PATH.AUTH}/login`} element={<SignIn />} />
        <Route
          path={`${API_ROUTES_PATH.AUTH}/forgot-password`}
          element={<ForgotPasswordPage />}
        />
        <Route
          path={`${API_ROUTES_PATH.AUTH}/reset-password`}
          element={<ResetPasswordPage />}
        />

        {/* Redirección EntryRoute*/}
        <Route path="/" element={<EntryRoute />} />

        {/* Not Found */}
        <Route
          path="/unauthorized"
          element={
            <ModulePlaceholder
              title="Acceso Denegado"
              description="Lo siento, no tienes permiso para acceder a esta página."
              showBackButton={true}
              backPath="/"
            />
          }
        />

        {/* =================================================================
            🔒 RUTAS PRIVADAS (Layout Principal)
           ================================================================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* 1. RUTAS DE ADMINISTRACIÓN COMPARTIDA */}
            <Route
              element={
                <RoleGuard allowedRoles={["Administrador", "SuperUser"]} />
              }
            >
              <Route path={API_ROUTES_PATH.ADMIN}>
                <Route path="users" element={<UsersPage />} />
              </Route>
            </Route>

            {/* 2. RUTAS SOLO PARA SUPER USUARIO (APPS.ALL) */}
            <Route element={<AppGuard requiredAppIds={[APPS.ALL]} />}>
              <Route
                element={
                  <RoleGuard allowedRoles={["SuperUser", "Administrador"]} />
                }
              >
                <Route path={API_ROUTES_PATH.ADMIN}>
                  <Route path="home" element={<AdminPage />} />
                </Route>
              </Route>
            </Route>

            {/* SECCIÓN FINANCE */}
            <Route
              element={<AppGuard requiredAppIds={[APPS.FINANCE, APPS.ALL]} />}
            >
              <Route path={API_ROUTES_PATH.FINANCE}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="cashes" element={<CashesPage />} />
                <Route path="incomes" element={<IncomesPage />} />
                <Route path="outcomes" element={<OutcomesPage />} />
                <Route path="persons" element={<PersonsPage />} />
                <Route
                  path="cash-denominations"
                  element={<CashDenominationPage />}
                />
              </Route>
            </Route>

            {/* SECCIÓN CONSOLIDATION */}
            <Route
              element={
                <AppGuard requiredAppIds={[APPS.CONSOLIDATION, APPS.ALL]} />
              }
            >
              <Route path={API_ROUTES_PATH.CONSOLIDATION}>
                <Route path="home" element={<ConsolidationPage />} />
                <Route path="members" element={<MembersPage />} />
              </Route>
            </Route>

            {/* SECCIÓN CAFETERIA / POS */}
            <Route
              element={
                <AppGuard requiredAppIds={[APPS.CAFETERIA, APPS.ALL]} />
              }
            >
              <Route path={API_ROUTES_PATH.CAFETERIA}>
                <Route path="pos" element={<POSPage />} />
                <Route path="products" element={<ProductsPage /> } />
                <Route path="bills" element={<BillsPage />} />
              </Route>
            </Route>

            {/* SECCIÓN NOT-FOUND */}
            <Route
              path="*"
              element={
                <ModulePlaceholder
                  title="Página no encontrada"
                  description="La página que buscas no existe."
                  showBackButton
                  backPath="/"
                />
              }
            />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};
