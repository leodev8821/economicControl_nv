import { useAuth } from '../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <h1>Bienvenido, {user?.first_name} {user?.last_name}!</h1>
      <p>Tu rol es: <strong>{user?.role}</strong></p>
      <button onClick={logout}>Cerrar Sesión</button>
      {/* Aquí irán los links a otras secciones protegidas */}
      <div className="dashboard-links">
        <a href="/cajas">Gestión de Cajas</a>
        <a href="/ingresos">Gestión de Ingresos</a>
        <a href="/egresos">Gestión de Egresos</a>
        <a href="/personas">Gestión de Personas</a>
        {/* <a href="/usuarios">Gestión de Usuarios</a> */}
      </div>
    </div>
  );
};