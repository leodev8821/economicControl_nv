import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@modules/auth/hooks/useAuth";

/**
 * Componente de Ruta Protegida.
 * Usa <Outlet /> para renderizar el componente hijo si el usuario está autenticado.
 * Si no está autenticado, lo redirige al Login.
 */
export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Estado de Carga: Si el AuthProvider aún está chequeando tokens,
  // mostramos un estado de carga temporal para evitar el parpadeo
  if (isLoading) {
    // Aquí puedes renderizar un spinner o un esqueleto de carga
    return <div>Cargando autenticación...</div>;
  }

  // 2. Lógica de Redirección: Si no está autenticado, lo enviamos al login
  if (!isAuthenticated) {
    // Redirige al usuario a la página de login
    // 'replace: true' asegura que el usuario no pueda volver al dashboard con el botón 'atrás'
    return <Navigate to="/login" replace />;
  }

  // 3. Renderizado de la Vista: Si está autenticado, renderizamos la ruta hija
  return <Outlet />;
};

// --- Opcional: Ruta pública para evitar que usuarios logueados vean el login ---

/**
 * Componente para restringir el acceso a rutas públicas (como Login o Registro)
 * si el usuario ya está autenticado.
 */
export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  // Si ya está autenticado, lo redirigimos al dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no está autenticado, permitimos el acceso a la ruta (ej. Login)
  return <Outlet />;
};
