import React, { useState } from 'react';
import { useReadIncomes, useCreateIncome, useDeleteIncome, useUpdateIncome } from '../hooks/useIncome';
import IncomeTable from '../components/tables/IncomeTable';
import IncomeForm from '../components/forms/IncomeForm';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';
import type { Income } from '../types/income.type';
import type { IncomeUpdateData } from '../api/incomeApi';
import * as SharedIncomeSchemas from '@economic-control/shared';

export const IncomesPage: React.FC = () => {
  const { data: incomes = [], isLoading, isError, error } = useReadIncomes();
  const createMutation = useCreateIncome();
  const deleteMutation = useDeleteIncome();
  const updateMutation = useUpdateIncome();

  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const handleCreateIncome = (income: SharedIncomeSchemas.IncomeCreationRequest) => {
    createMutation.mutate(income, {
        onSuccess: () => {
             // Success logic
        }
    });
  };

  const handleUpdateIncome = (income: IncomeUpdateData) => {
    updateMutation.mutate(income, {
        onSuccess: () => {
             setEditingIncome(null);
        }
    });
  };

  const handleFormSubmit = (data: SharedIncomeSchemas.IncomeCreationRequest) => {
       if (editingIncome) {
           handleUpdateIncome({ ...data, id: editingIncome.id });
       } else {
           handleCreateIncome(data);
       }
  };

  const handleStartEdit = (income: Income) => {
      setEditingIncome(income);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
      setEditingIncome(null);
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
          Mensaje: {error?.message}
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
      {(deleteMutation.isPending || updateMutation.isPending || createMutation.isPending) && (
        <Typography color="primary">
          Realizando acción en el servidor...
        </Typography>
      )}

      {/* Mensaje de error si la eliminación o actualización falló */}
      {(deleteMutation.isError || updateMutation.isError || createMutation.isError) && (
        <Typography color="error.main">
          Error: {deleteMutation.error?.message || updateMutation.error?.message || createMutation.error?.message}
        </Typography>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
        <IncomeForm 
            initialValues={editingIncome}
            onSubmit={handleFormSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
            isUpdateMode={!!editingIncome}
            onCancel={handleCancelEdit}
        /> 
      </Paper>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Listado de Ingresos ({incomes.length})
        </Typography>
      </Box>

      {incomes.length > 0 ? (
        <IncomeTable 
          incomes={incomes}
          onEdit={handleStartEdit}
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