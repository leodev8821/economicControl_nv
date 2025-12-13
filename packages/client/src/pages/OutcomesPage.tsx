import React, { useState } from 'react';
import { useCreateOutcome, useReadOutcomes, useDeleteOutcome, useUpdateOutcome } from '../hooks/useOutcome';
import OutcomeTable from '../components/tables/OutcomeTable';
import OutcomeForm from '../components/forms/OutcomeForm';
import * as SharedOutcomeSchemas from '@economic-control/shared';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';
import type { Outcome } from '../types/outcome.type';
import type { OutcomeUpdateData } from '../api/outcomeApi';

export const OutcomesPage: React.FC = () => {
  const { data: outcomes = [], isLoading, isError, error } = useReadOutcomes();
  const createMutation = useCreateOutcome();
  const updateMutation = useUpdateOutcome();
  const deleteMutation = useDeleteOutcome();

  const [editingOutcome, setEditingOutcome] = useState<Outcome | null>(null);

  const handleCreateOutcome = (outcome: SharedOutcomeSchemas.OutcomeCreationRequest) => {
    createMutation.mutate(outcome, {
        onSuccess: () => {
             // Form cleans itself or we can do extra stuff here
        }
    });
  };

  const handleUpdateOutcome = (outcome: OutcomeUpdateData) => {
    updateMutation.mutate(outcome, {
        onSuccess: () => {
            setEditingOutcome(null);
        }
    });
  };

  const handleFormSubmit = (data: SharedOutcomeSchemas.OutcomeCreationRequest) => {
       if (editingOutcome) {
           handleUpdateOutcome({ ...data, id: editingOutcome.id });
       } else {
           handleCreateOutcome(data);
       }
  };

  const handleDeleteOutcome = (id: GridRowId) => {
    const outcomeId = parseInt(id.toString());

    if (window.confirm(`¿Está seguro de eliminar el Egreso con ID ${outcomeId}? Esta acción es irreversible.`)) {
      // 💥 Ejecuta la mutación de eliminación
      deleteMutation.mutate(outcomeId);
    }
  };

  const handleStartEdit = (outcome: Outcome) => {
      setEditingOutcome(outcome);
      // Optional: scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
      setEditingOutcome(null);
  };

  // 1. Renderizado Principal (Siempre muestra el formulario)
  return (
      <Box p={3}>
        {/* Indicador de que una mutación está en curso (opcional) */}
        {(deleteMutation.isPending || updateMutation.isPending) && (
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
          <OutcomeForm 
             initialValues={editingOutcome}
             onSubmit={handleFormSubmit}
             isLoading={createMutation.isPending || updateMutation.isPending}
             isUpdateMode={!!editingOutcome}
             onCancel={handleCancelEdit}
          /> 
        </Paper>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Listado de Egresos ({outcomes.length})
          </Typography>
        </Box>
  
        {/* Sección Condicional: Loading / Error / Tabla / Vacío */}
        {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={5}>
            <CircularProgress />
            <Typography variant="h6" ml={2}>
              Cargando listado de egresos...
            </Typography>
          </Box>
        )}

        {/* Error real */}
        {isError && !isLoading && (
          <Box p={3} color="error.main">
            <Typography variant="h6" gutterBottom>
              Error al cargar egresos
            </Typography>
            <Typography variant="body2">
              Mensaje: {error?.message}
            </Typography>
          </Box>
        )}

        {/* Lista vacía */}
        {!isLoading && !isError && outcomes.length === 0 && (
          <Typography variant="body1">
            No hay egresos registrados en este momento.
          </Typography>
        )}

        {/* Tabla */}
        {!isLoading && !isError && outcomes.length > 0 && (
          <OutcomeTable
            outcomes={outcomes}
            onEdit={handleStartEdit}
            onDelete={handleDeleteOutcome}
          />
        )}
      </Box>
    );
  };