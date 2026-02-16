import React, { useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  Button,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import { parseWithZod } from "@conform-to/zod/v4";
import {
  useReadOutcomes,
  useUpdateOutcome,
  useDeleteOutcome,
  useCreateBulkOutcome,
} from "@modules/finance/hooks/useOutcome";
import OutcomeTable from "@modules/finance/components/tables/OutcomeTable";
import BulkOutcomeForm from "@modules/finance/components/forms/BulkOutcomeForm";
import type { Outcome } from "@modules/finance/types/outcome.type";
import * as SharedOutcomeSchemas from "@economic-control/shared";

const OutcomesPage: React.FC = () => {
  const [formKey, setFormKey] = useState(0);
  const [draft, setDraft] = useState<any>(null);
  const [editingOutcome, setEditingOutcome] = useState<Outcome | null>(null);

  const { data: outcomes = [], isLoading, isError, error } = useReadOutcomes();
  const deleteMutation = useDeleteOutcome();
  const updateMutation = useUpdateOutcome();
  const createBulkMutation = useCreateBulkOutcome();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const formRef = React.useRef<HTMLDivElement | null>(null);

  // --- Lógica de Borrador ---
  React.useEffect(() => {
    const savedDraft = localStorage.getItem("bulk_outcome_draft");
    if (savedDraft && !editingOutcome) {
      setDraft(JSON.parse(savedDraft));
      setFormKey((prev) => prev + 1);
    }
  }, [editingOutcome]);

  const handleClearDraft = () => {
    localStorage.removeItem("bulk_outcome_draft");
    setDraft(null);
    setFormKey((prev) => prev + 1);
    showSnackbar("Borrador de egresos eliminado");
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // --- Manejo del Formulario ---
  const handleBulkSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const submission = parseWithZod(formData, {
      schema: SharedOutcomeSchemas.BulkOutcomeSchema,
    });

    if (submission.status !== "success") return;

    const payload = submission.value.outcomes.map((item) => ({
      ...item,
      week_id: submission.value.common_week_id,
    }));

    if (editingOutcome) {
      updateMutation.mutate(
        { ...payload[0], id: editingOutcome.id },
        {
          onSuccess: () => {
            setEditingOutcome(null);
            setFormKey((prev) => prev + 1);
            showSnackbar("Egreso actualizado correctamente");
          },
          onError: () => showSnackbar("Error al actualizar", "error"),
        },
      );
      return;
    }

    createBulkMutation.mutate(payload, {
      onSuccess: () => {
        localStorage.removeItem("bulk_outcome_draft");
        setDraft(null);
        setFormKey((prev) => prev + 1);
        showSnackbar("Egresos registrados correctamente");
      },
      onError: () => showSnackbar("Error al guardar", "error"),
    });
  };

  const handleStartEdit = (outcome: Outcome) => {
    setEditingOutcome(outcome);
    setFormKey((prev) => prev + 1);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleDeleteOutcome = (id: number) => {
    if (window.confirm(`¿Está seguro de eliminar el Egreso con ID ${id}?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => showSnackbar("Egreso eliminado"),
        onError: () => showSnackbar("Error al eliminar", "error"),
      });
    }
  };

  const bulkInitialValues = editingOutcome
    ? {
        common_week_id: editingOutcome.week_id,
        outcomes: [editingOutcome],
      }
    : draft || undefined;

  return (
    <Box p={3}>
      {(deleteMutation.isPending || updateMutation.isPending) && (
        <Typography color="error" sx={{ mb: 1, fontWeight: "bold" }}>
          Procesando cambio en el servidor...
        </Typography>
      )}

      {editingOutcome && (
        <Alert
          severity="info"
          sx={{ mb: 3, position: "sticky", top: 0, zIndex: 10 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setEditingOutcome(null)}
            >
              Cancelar
            </Button>
          }
        >
          Editando egreso ID {editingOutcome.id}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Gestión de Egresos
      </Typography>

      <Paper ref={formRef} elevation={3} sx={{ p: 3, mb: 4 }}>
        {draft && !editingOutcome && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleClearDraft}>
                Descartar
              </Button>
            }
          >
            Borrador de egresos recuperado.
          </Alert>
        )}

        <BulkOutcomeForm
          key={formKey}
          onSubmit={handleBulkSubmit}
          isLoading={createBulkMutation.isPending || updateMutation.isPending}
          initialValues={bulkInitialValues}
          disableAdd={!!editingOutcome}
          isEditMode={!!editingOutcome}
          onCancel={() => {
            setEditingOutcome(null);
            setFormKey((prev) => prev + 1);
          }}
        />
      </Paper>

      {isLoading ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={5}>
          <CircularProgress color="error" />
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
            onEdit={(outcome) => {
              if (editingOutcome) return;
              handleStartEdit(outcome);
            }}
            onDelete={(id) => handleDeleteOutcome(Number(id))}
          />
        </Paper>
      )}

      {isError && !isLoading && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error al cargar egresos: {error?.message}
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default OutcomesPage;
