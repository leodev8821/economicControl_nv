import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './components/shared/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { IncomesPage } from './pages/IncomePage';
import { LoginPage } from './pages/LoginPage';

function App() {

  return (
    <>
      <Routes>
      {/* 1. Ruta Raíz: Redirige automáticamente al Login (o Dashboard si está logueado) */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* 2. Rutas Públicas (Usan PublicOnlyRoute para restringir si ya está logueado) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/registro" element={<RegisterPage />} /> */}
      </Route>

      {/* 3. Rutas Protegidas (Requieren autenticación) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ingresos" element={<IncomesPage />} />
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
