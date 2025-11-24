import { usePersons } from '../hooks/usePerson';
import PersonTable from '../components/tables/PersonTable';
import { Box, Typography, CircularProgress } from '@mui/material';

export const PersonsPage: React.FC = () => {
  // Desestructuramos el resultado de React Query:
  const { data: persons = [], isLoading, isError, error } = usePersons();

  // 1. Estado de Carga
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography variant="h6" ml={2}>
          Cargando listado de personas...
        </Typography>
      </Box>
    );
  }

  // 2. Estado de Error
  if (isError) {
    return (
      <Box p={3} color="error.main">
        <Typography variant="h4" gutterBottom>
          Error al cargar personas
        </Typography>
        <Typography variant="body1" component="p" sx={{ mb: 2 }}>
          Mensaje: {error.message}
        </Typography>
        <Typography variant="body1" component="p" sx={{ mb: 2 }}>
          No se pudo completar la solicitud. Por favor, intente cerrar sesión y volver a entrar.
        </Typography>
      </Box>
    );
  }

  // 3. Renderizado de la Data
  return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Listado de Personas ({persons.length})
          </Typography>
        </Box>
  
        {persons.length > 0 ? (
          <PersonTable persons={persons} />
        ) : (
          <Typography variant="body1">
            No hay personas creadas en este momento.
          </Typography>
        )}
      </Box>
  );
};