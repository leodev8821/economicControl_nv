import { useIncomes, useDeleteIncome, useUpdateIncome } from '../hooks/useIncome';
import IncomeTable from '../components/tables/IncomeTable';
import { Box, Typography, CircularProgress } from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';

export const IncomesPage: React.FC = () => {
  const { data: incomes = [], isLoading, isError, error } = useIncomes();
  const deleteMutation = useDeleteIncome();
  const updateMutation = useUpdateIncome();

  // Definición de las funciones de acción
  const handleUpdateIncome = (id: GridRowId) => {
    // Al hacer clic, aquí es donde se abriría un modal/formulario precargado.
    // Una vez que el formulario se envía, se llama a updateMutation.mutate()
    console.log(`[Página] Solicitud para Abrir Formulario de Actualización para ID: ${id}`);

    // EJEMPLO (en un flujo real, la data vendría de un formulario):
    // const incomeId = parseInt(id.toString());
    // updateMutation.mutate({
    //   id: incomeId,
    //   date: new Date().toISOString(), // Valores de ejemplo para update
    //   amount: 150.00,
    //   source: 'Diezmo',
    //   week_id: 10,
    //   person_id: 1,
    // });
  };

  const handleDeleteIncome = (id: GridRowId) => {
    const incomeId = parseInt(id.toString());

    if (window.confirm(`¿Está seguro de eliminar el Ingreso con ID ${incomeId}? Esta acción es irreversible.`)) {
      // 💥 Ejecuta la mutación de eliminación
      deleteMutation.mutate(incomeId);
    }
  };

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
      </Box>
    );
  }

  // 3. Renderizado de la Data
  return (
    <Box p={3}>
      {/* Indicador de que una mutación está en curso (opcional) */}
      {(deleteMutation.isPending || updateMutation.isPending) && (
        <Typography color="primary">
          Realizando acción en el servidor...
        </Typography>
      )}

      {/* Mensaje de error si la eliminación o actualización falló */}
      {deleteMutation.isError && (
        <Typography color="error.main">
          Error al eliminar el ingreso: {deleteMutation.error.message}
        </Typography>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Listado de Ingresos ({incomes.length})
        </Typography>
      </Box>

      {incomes.length > 0 ? (
        <IncomeTable 
          incomes={incomes}
          onUpdate={handleUpdateIncome}
          onDelete={handleDeleteIncome}
        />
      ) : (
        <Typography variant="body1">
          No hay ingresos registrados en este momento.
        </Typography>
      )}
    </Box>
  );
};