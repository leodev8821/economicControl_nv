import { useIncomes } from '../hooks/useIncome';
import { useAuth } from '../hooks/useAuth'; // Necesario para demostrar el cierre de sesión

export const IncomesPage: React.FC = () => {
  // Desestructuramos el resultado de React Query:
  const { data: incomes, isLoading, isError, error } = useIncomes();
  const { logout } = useAuth(); 

  // 1. Estado de Carga
  if (isLoading) {
    return (
      <div className="loading-spinner">
        Cargando listado de ingresos...
      </div>
    );
  }

  // 2. Estado de Error
  if (isError) {
    // Si hay un error, el interceptor de Axios ya intentó la renovación. 
    // Si falla aquí, la sesión es probablemente inválida.
    return (
      <div className="error-message" style={{ color: 'red', padding: '20px' }}>
        <h2>Error al cargar ingresos</h2>
        <p>Mensaje: {error.message}</p>
        <p>No se pudo completar la solicitud. Por favor, intente cerrar sesión y volver a entrar.</p>
        <button onClick={logout}>Cerrar Sesión</button>
      </div>
    );
  }

  // 3. Renderizado de la Data
  return (
    <div className="incomes-container">
      <h1>Listado de Ingresos ({incomes?.length || 0})</h1>
      <button onClick={() => logout()}>Cerrar Sesión</button>
      
      {incomes && incomes.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Fuente</th>
              <th>ID Persona</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((income) => (
              <tr key={income.id}>
                <td>{income.id}</td>
                {/* Formateamos la fecha a un formato local legible */}
                <td>{new Date(income.date).toLocaleDateString()}</td>
                {/* Formateamos el monto a dos decimales */}
                <td>{income.amount.toFixed(2)} €</td>
                <td>{income.source}</td>
                <td>{income.person_id || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay ingresos registrados en este momento.</p>
      )}
    </div>
  );
};