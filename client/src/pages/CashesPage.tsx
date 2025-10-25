import { useCashes } from '../hooks/useCash';
import CashTable from '../components/tables/CashTable';
import { Box, Typography, CircularProgress } from '@mui/material';

export const CashesPage: React.FC = () => {
  const { data: cashes = [], isLoading, isError, error } = useCashes();

  // 1. Estado de Carga
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography variant="h6" ml={2}>
          Cargando listado de cajas...
        </Typography>
      </Box>
    );
  }

  // 2. Estado de Error
  if (isError) {
    return (
      <Box p={3} color="error.main">
        <Typography variant="h4" gutterBottom>
          Error al cargar cajas
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
          Listado de Cajas ({cashes.length})
        </Typography>
      </Box>

      {cashes.length > 0 ? (
        <CashTable cashes={cashes} />
      ) : (
        <Typography variant="body1">
          No hay cajas creadas en este momento.
        </Typography>
      )}
    </Box>
  );
};