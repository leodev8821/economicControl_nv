import { useCashes } from '../hooks/useCash';
import { useAuth } from '../hooks/useAuth'; // Necesario para demostrar el cierre de sesión

export const CashesPage: React.FC = () => {
  // Desestructuramos el resultado de React Query:
  const { data: cashes, isLoading, isError, error } = useCashes();
  const { logout } = useAuth(); 

  // 1. Estado de Carga
  if (isLoading) {
    return (
      <div className="loading-spinner">
        Cargando listado de las cajas...
      </div>
    );
  }

  // 2. Estado de Error
  if (isError) {
    // Si hay un error, el interceptor de Axios ya intentó la renovación. 
    // Si falla aquí, la sesión es probablemente inválida.
    return (
      <div className="error-message" style={{ color: 'red', padding: '20px' }}>
        <h2>Error al cargar las cajas</h2>
        <p>Mensaje: {error.message}</p>
        <p>No se pudo completar la solicitud. Por favor, intente cerrar sesión y volver a entrar.</p>
        <button onClick={logout}>Cerrar Sesión</button>
      </div>
    );
  }

  // 3. Renderizado de la Data
  return (
    <div className="cashes-container">
      <h1>Listado de Cajas ({cashes?.length || 0})</h1>
      <button onClick={() => logout()}>Cerrar Sesión</button>
      
      {cashes && cashes.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Saldo Actual</th>
              <th>Límite de caja</th>
            </tr>
          </thead>
          <tbody>
            {cashes.map((cash) => (
              <tr key={cash.id}>
                <td>{cash.id}</td>
                <td>{cash.name}</td>
                {/* Formateamos el monto a dos decimales */}
                <td>{cash.actual_amount.toFixed(2)} €</td>
                <td>{cash.pettyCash_limit?.toFixed(2) || '-'} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay cajas registradas en este momento.</p>
      )}
    </div>
  );
};