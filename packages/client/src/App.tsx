import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "./components/shared/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import { DashboardPage } from "./pages/DashboardPage";
import { CashesPage } from "./pages/CashesPage";
import { IncomesPage } from "./pages/IncomesPage";
import { OutcomesPage } from "./pages/OutcomesPage";
import { PersonsPage } from "./pages/PersonsPage";
import { CashDenominationPage } from "./pages/CashDenominationPage";
import { UserPage } from "./pages/UsersPage";
import SignIn from "./pages/SignIn";

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
