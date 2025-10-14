import { useOutcomes } from '../hooks/useOutcome';
import { useAuth } from '../hooks/useAuth'; // Necesario para demostrar el cierre de sesión

export const OutcomesPage: React.FC = () => {
  // Desestructuramos el resultado de React Query:
  const { data: outcomes, isLoading, isError, error } = useOutcomes();
  const { logout } = useAuth(); 

  // 1. Estado de Carga
  if (isLoading) {
    return (
      <div className="loading-spinner">
        Cargando listado de egresos...
      </div>
    );
  }

  // 2. Estado de Error
  if (isError) {
    // Si hay un error, el interceptor de Axios ya intentó la renovación. 
    // Si falla aquí, la sesión es probablemente inválida.
    return (
      <div className="error-message" style={{ color: 'red', padding: '20px' }}>
        <h2>Error al cargar egresos</h2>
        <p>Mensaje: {error.message}</p>
        <p>No se pudo completar la solicitud. Por favor, intente cerrar sesión y volver a entrar.</p>
        <button onClick={logout}>Cerrar Sesión</button>
      </div>
    );
  }

  // 3. Renderizado de la Data
  return (
    <div className="outcomes-container">
      <h1>Listado de Egresos ({outcomes?.length || 0})</h1>
      <button onClick={() => logout()}>Cerrar Sesión</button>
      
      {outcomes && outcomes.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Caja</th>
              <th>ID Semana</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Descripción</th>
              <th>Categoría</th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map((outcome) => (
              <tr key={outcome.id}>
                <td>{outcome.id}</td>
                <td>{outcome.cash_id}</td>
                <td>{outcome.week_id}</td>
                {/* Formateamos la fecha a un formato local legible */}
                <td>{new Date(outcome.date).toLocaleDateString()}</td>
                {/* Formateamos el monto a dos decimales */}
                <td>{outcome.amount.toFixed(2)} €</td>
                <td>{outcome.description || '-'}</td>
                <td>{outcome.category || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay egresos registrados en este momento.</p>
      )}
    </div>
  );
};