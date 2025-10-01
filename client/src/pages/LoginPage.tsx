import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/user';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Estado local para los campos del formulario
  const [credentials, setCredentials] = useState<LoginCredentials>({
    login_data: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Redireccionar si ya está autenticado
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null; 
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(credentials);
      // Éxito: El AuthProvider nos autentica y el 'if (isAuthenticated)' nos redirige.
      // Sin embargo, podemos forzar una navegación para mayor claridad:
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Capturamos el error que fue propagado desde authApi.ts
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al iniciar sesión.';
      setError(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login_data">Nombre de Usuario:</label>
          <input
            id="login_data"
            name="login_data"
            type="text"
            value={credentials.login_data}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};