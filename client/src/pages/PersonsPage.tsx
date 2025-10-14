import { usePersons } from '../hooks/usePerson';
import { useAuth } from '../hooks/useAuth'; // Necesario para demostrar el cierre de sesión

export const PersonsPage: React.FC = () => {
  // Desestructuramos el resultado de React Query:
  const { data: persons, isLoading, isError, error } = usePersons();
  const { logout } = useAuth(); 

  // 1. Estado de Carga
  if (isLoading) {
    return (
      <div className="loading-spinner">
        Cargando listado de personas...
      </div>
    );
  }

  // 2. Estado de Error
  if (isError) {
    // Si hay un error, el interceptor de Axios ya intentó la renovación. 
    // Si falla aquí, la sesión es probablemente inválida.
    return (
      <div className="error-message" style={{ color: 'red', padding: '20px' }}>
        <h2>Error al cargar personas</h2>
        <p>Mensaje: {error.message}</p>
        <p>No se pudo completar la solicitud. Por favor, intente cerrar sesión y volver a entrar.</p>
        <button onClick={logout}>Cerrar Sesión</button>
      </div>
    );
  }

  // 3. Renderizado de la Data
  return (
    <div className="persons-container">
      <h1>Listado de Personas ({persons?.length || 0})</h1>
      <button onClick={() => logout()}>Cerrar Sesión</button>
      
      {persons && persons.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre(s)</th>
              <th>Apellido(s)</th>
              <th>NIF</th>
              <th>Activo?</th>
            </tr>
          </thead>
          <tbody>
            {persons.map((person) => (
              <tr key={person.id}>
                <td>{person.id}</td>
                <td>{person.first_name}</td>
                <td>{person.last_name}</td>
                <td>{person.dni}</td>
                <td>{person.isVisible ? 'Si' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay personas registradas en este momento.</p>
      )}
    </div>
  );
};