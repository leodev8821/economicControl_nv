import React, { useState } from "react";
import {
  useCreateOutcome,
  useReadOutcomes,
  useUpdateOutcome,
  useDeleteOutcome,
  useCreateBulkOutcome,
} from "../hooks/useOutcome";
import OutcomeTable from "../components/tables/OutcomeTable";
import OutcomeForm from "../components/forms/OutcomeForm";
import BulkOutcomeForm from "../components/forms/BulkOutcomeForm";
import * as SharedOutcomeSchemas from "@economic-control/shared";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
  Alert,
} from "@mui/material";
import type { GridRowId } from "@mui/x-data-grid";
import type { Outcome } from "../types/outcome.type";
import type { OutcomeUpdateData } from "../api/outcomeApi";
import { parseWithZod } from "@conform-to/zod/v4";

export const OutcomesPage: React.FC = () => {
  const { data: outcomes = [], isLoading, isError, error } = useReadOutcomes();
  const createMutation = useCreateOutcome();
  const updateMutation = useUpdateOutcome();
  const deleteMutation = useDeleteOutcome();
  const createBulkMutation = useCreateBulkOutcome();

  const [editingOutcome, setEditingOutcome] = useState<Outcome | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // --- Lógica de Bulk ---
  const handleBulkSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Validamos con el schema de Bulk
    const submission = parseWithZod(formData, {
      schema: SharedOutcomeSchemas.BulkOutcomeSchema,
    });

    if (submission.status !== "success") return;

    const payload = submission.value.outcomes.map((item) => ({
      ...item,
      week_id: submission.value.common_week_id, // Inyectamos el ID global
    }));

    createBulkMutation.mutate(payload, {
      onSuccess: () => {
        setTabValue(0); // Volver a la tabla tras éxito
      },
    });
  };

  // --- Lógica Individual ---
  const handleFormSubmit = (
    data: SharedOutcomeSchemas.OutcomeCreationRequest,
  ) => {
    if (editingOutcome) {
      updateMutation.mutate(
        { ...data, id: editingOutcome.id },
        {
          onSuccess: () => setEditingOutcome(null),
        },
      );
    } else {
      createMutation.mutate(data);
    }
  };

  const handleStartEdit = (outcome: Outcome) => {
    setEditingOutcome(outcome);
    setTabValue(0); // Forzamos el tab individual al editar
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteOutcome = (id: GridRowId) => {
    const outcomeId = parseInt(id.toString());
    if (
      window.confirm(`¿Está seguro de eliminar el Egreso con ID ${outcomeId}?`)
    ) {
      deleteMutation.mutate(outcomeId);
    }
  };

  // 1. Renderizado Principal (Siempre muestra el formulario)
  return (
    <Box p={3}>
      {/* Indicador de que una mutación está en curso*/}
      {(deleteMutation.isPending || updateMutation.isPending) && (
        <Typography color="primary">
          Realizando acción en el servidor...
        </Typography>
      )}

      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Gestión de Egresos
      </Typography>

      {/* Alertas de Error Consolidadas */}
      {(deleteMutation.isError ||
        updateMutation.isError ||
        createMutation.isError ||
        createBulkMutation.isError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Hubo un problema al procesar la solicitud. Por favor, intente de
          nuevo.
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} centered>
          <Tab label="Registro Individual" />
          <Tab label="Carga Masiva" />
        </Tabs>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: "background.paper" }}>
        {tabValue === 0 ? (
          <OutcomeForm
            initialValues={editingOutcome}
            onSubmit={handleFormSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
            isUpdateMode={!!editingOutcome}
            onCancel={() => setEditingOutcome(null)}
          />
        ) : (
          <BulkOutcomeForm
            onSubmit={handleBulkSubmit}
            isLoading={createBulkMutation.isPending}
          />
        )}
      </Paper>

      {/* Sección Condicional: Loading / Error / Tabla / Vacío */}
      {isLoading ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={5}>
          <CircularProgress />
          <Typography variant="h6" mt={2}>
            Cargando listado de egresos...
          </Typography>
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 2, p: 1 }}>
            Historial de Egresos ({outcomes.length})
          </Typography>
          <OutcomeTable
            outcomes={outcomes}
            onEdit={handleStartEdit}
            onDelete={handleDeleteOutcome}
          />
        </Paper>
      )}

      {/* Error real */}
      {isError && !isLoading && (
        <Box p={3} color="error.main">
          <Typography variant="h6" gutterBottom>
            Error al cargar egresos
          </Typography>
          <Typography variant="body2">Mensaje: {error?.message}</Typography>
        </Box>
      )}
    </Box>
  );
};
