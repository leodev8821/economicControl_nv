import { useOutcomes } from '../hooks/useOutcome';
import OutcomeTable from '../components/tables/OutcomeTable';
import { Box, Typography, CircularProgress } from '@mui/material';

export const OutcomesPage: React.FC = () => {
  const { data: outcomes = [], isLoading, isError, error } = useOutcomes();

  // 1. Estado de Carga
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography variant="h6" ml={2}>
          Cargando listado de egresos...
        </Typography>
      </Box>
    );
  }

  // 2. Estado de Error
  if (isError) {
    return (
      <Box p={3} color="error.main">
        <Typography variant="h4" gutterBottom>
          Error al cargar egresos
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
          Listado de Egresos ({outcomes.length})
        </Typography>
      </Box>

      {outcomes.length > 0 ? (
        <OutcomeTable outcomes={outcomes} />
      ) : (
        <Typography variant="body1">
          No hay egresos registrados en este momento.
        </Typography>
      )}
    </Box>
  );
};