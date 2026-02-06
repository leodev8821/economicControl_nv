import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "@modules/auth/components/ProtectedRoute";
import AppLayout from "@shared/components/layout/AppLayout";

import { DashboardPage } from "@modules/finance/pages/DashboardPage";
import { CashesPage } from "@modules/finance/pages/CashesPage";
import { IncomesPage } from "@modules/finance/pages/IncomesPage";
import { OutcomesPage } from "@modules/finance/pages/OutcomesPage";
import { PersonsPage } from "@modules/finance/pages/PersonsPage";
import { CashDenominationPage } from "@modules/finance/pages/CashDenominationPage";
import { UserPage } from "@modules/auth/pages/UsersPage";
import SignIn from "@modules/auth/pages/SignIn";

function App() {
  return (
    <>
      <Routes>
        {/* 1. Ruta Raíz: Redirige automáticamente al Login (o Dashboard si está logueado) */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 2. Rutas Públicas (Usan PublicOnlyRoute para restringir si ya está logueado) */}
        <Route element={<PublicOnlyRoute />}>
          {/*<Route path="/login" element={<LoginPage />} />*/}
          <Route path="/login" element={<SignIn />} />
          {/* <Route path="/registro" element={<RegisterPage />} /> */}
        </Route>

        {/* 3. Rutas Protegidas (Requieren autenticación) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/personas" element={<PersonsPage />} />
            <Route path="/cajas" element={<CashesPage />} />
            <Route path="/ingresos" element={<IncomesPage />} />
            <Route path="/egresos" element={<OutcomesPage />} />
            <Route path="/arqueo" element={<CashDenominationPage />} />
            <Route path="/usuarios" element={<UserPage />} />
          </Route>
        </Route>

        {/* 4. Ruta 404 (Página no encontrada) */}
        <Route path="*" element={<h1>404 | Página no encontrada</h1>} />
      </Routes>
    </>
  );
}

export default App;
