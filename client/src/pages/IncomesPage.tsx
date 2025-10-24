import { useIncomes } from '../hooks/useIncome';
import { useAuth } from '../hooks/useAuth';
import IncomeTable from '../components/ui/components/tables/IncomeTable';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

export const IncomesPage: React.FC = () => {
  const { data: incomes = [], isLoading, isError, error } = useIncomes();
  const { logout } = useAuth();

  // 1. Estado de Carga
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography variant="h6" ml={2}>
          Cargando listado de ingresos...
        </Typography>
      </Box>
    );
  }

  // 2. Estado de Error
  if (isError) {
    return (
      <Box p={3} color="error.main">
        <Typography variant="h4" gutterBottom>
          Error al cargar ingresos
        </Typography>
        <Typography variant="body1" component="p" sx={{ mb: 2 }}>
          Mensaje: {error.message}
        </Typography>
        <Typography variant="body1" component="p" sx={{ mb: 2 }}>
          No se pudo completar la solicitud. Por favor, intente cerrar sesión y volver a entrar.
        </Typography>
        <Button variant="contained" color="primary" onClick={logout}>
          Cerrar Sesión
        </Button>
      </Box>
    );
  }

  // 3. Renderizado de la Data
  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Listado de Ingresos ({incomes.length})
        </Typography>
        <Button variant="contained" color="primary" onClick={logout}>
          Cerrar Sesión
        </Button>
      </Box>

      {incomes.length > 0 ? (
        <IncomeTable incomes={incomes} />
      ) : (
        <Typography variant="body1">
          No hay ingresos registrados en este momento.
        </Typography>
      )}
    </Box>
  );
};