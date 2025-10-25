import { useAuth } from '../hooks/useAuth';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">

      <h1>Bienvenido, {user?.first_name} {user?.last_name}!</h1>
      <p>Tu rol es: <strong>{user?.role}</strong></p>
    </div>
  );
};