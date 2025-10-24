import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './components/shared/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { CashesPage } from './pages/CashesPage';
import { IncomesPage } from './pages/IncomesPage';
import { OutcomesPage } from './pages/OutcomesPage';
import { PersonsPage } from './pages/PersonsPage';
import IncomeForm from './components/ui/components/forms/IncomeForm'
//import { LoginPage } from './pages/LoginPage';
import SignIn from './pages/SignIn';
import DataGridPremiumDemo from './components/ui/components/tables/IncomeTable';

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
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/personas" element={<PersonsPage />} />
        <Route path="/cajas" element={<CashesPage />} />
        <Route path="/ingresos" element={<IncomesPage />} />
        <Route path="/egresos" element={<OutcomesPage />} />
        <Route path="/nuevo-ingreso" element={<IncomeForm />} />
        <Route path="/table" element={<DataGridPremiumDemo />} />
        {/* Ejemplo de otra ruta protegida: */}
        {/* <Route path="/usuarios" element={<UsersManagementPage />} /> */}
      </Route>

      {/* 4. Ruta 404 (Página no encontrada) */}
      <Route path="*" element={<h1>404 | Página no encontrada</h1>} />
    </Routes>
    </>
  )
}

export default App
