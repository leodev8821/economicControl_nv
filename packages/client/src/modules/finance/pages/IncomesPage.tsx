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
  useReadIncomes,
  useUpdateIncome,
  useDeleteIncome,
  useCreateBulkIncome,
} from "@modules/finance/hooks/useIncome";
import IncomeTable from "@modules/finance/components/tables/IncomeTable";
import BulkIncomeForm from "@modules/finance/components/forms/BulkIncomeForm";
import type { Income } from "@modules/finance/types/income.type";
import * as SharedIncomeSchemas from "@economic-control/shared";

const IncomesPage: React.FC = () => {
  const [formKey, setFormKey] = useState(0);
  const [draft, setDraft] = useState<any>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const { data: incomes = [], isLoading, isError, error } = useReadIncomes();
  const deleteMutation = useDeleteIncome();
  const updateMutation = useUpdateIncome();
  const createBulkMutation = useCreateBulkIncome();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const formRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const savedDraft = localStorage.getItem("bulk_income_draft");
    if (savedDraft && !editingIncome) {
      setDraft(JSON.parse(savedDraft));
      setFormKey((prev) => prev + 1);
    }
  }, [editingIncome]);

  const handleClearDraft = () => {
    localStorage.removeItem("bulk_income_draft");
    setDraft(null);
    setFormKey((prev) => prev + 1);
    showSnackbar("Borrador eliminado");
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // --- Lógica de Bulk ---
  const handleBulkSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const submission = parseWithZod(formData, {
      schema: SharedIncomeSchemas.BulkIncomeSchema,
    });

    if (submission.status !== "success") {
      console.log("Errores de validación:", submission.reply());
      return;
    }

    const payload = submission.value.incomes.map((item) => ({
      ...item,
      week_id: submission.value.common_week_id,
      person_id: item.person_id || null,
    }));

    // modo edición → update
    if (editingIncome) {
      updateMutation.mutate(
        { ...payload[0], id: editingIncome.id },
        {
          onSuccess: () => {
            setEditingIncome(null);
            setFormKey((prev) => prev + 1);
            showSnackbar("Ingreso actualizado correctamente");
          },
          onError: () => showSnackbar("Error al actualizar", "error"),
        },
      );
      return;
    }

    createBulkMutation.mutate(payload, {
      onSuccess: () => {
        localStorage.removeItem("bulk_income_draft");
        setDraft(null);
        setEditingIncome(null);
        setFormKey((prev) => prev + 1);
        showSnackbar("Ingresos creados correctamente");
      },
      onError: () => showSnackbar("Error al guardar", "error"),
    });
  };

  const handleStartEdit = (income: Income) => {
    setEditingIncome(income);
    setFormKey((prev) => prev + 1);
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleDeleteIncome = (id: number) => {
    if (window.confirm(`¿Está seguro de eliminar el Ingreso con ID ${id}?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => showSnackbar("Ingreso eliminado"),
        onError: () => showSnackbar("Error al eliminar", "error"),
      });
    }
  };

  const bulkInitialValues = editingIncome
    ? {
        common_week_id: editingIncome.week_id,
        incomes: [editingIncome],
      }
    : draft
      ? draft
      : undefined;

  // 1. Renderizado Principal
  return (
    <Box p={3}>
      {/* Indicador de que una mutación está en curso*/}
      {(deleteMutation.isPending || updateMutation.isPending) && (
        <Typography color="primary">
          Realizando acción en el servidor...
        </Typography>
      )}

      {editingIncome && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setEditingIncome(null)}
            >
              Cancelar
            </Button>
          }
        >
          Estás editando el ingreso ID {editingIncome.id}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Gestión de Ingresos
      </Typography>

      {/* Alertas de Error Consolidadas */}
      {(deleteMutation.isError ||
        updateMutation.isError ||
        createBulkMutation.isError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Hubo un problema al procesar la solicitud. Por favor, intente de
          nuevo.
        </Alert>
      )}

      <Paper ref={formRef} elevation={3} sx={{ p: 3, mb: 4, bgcolor: "paper" }}>
        {/* Banner de Borrador Recuperado */}
        {draft && !editingIncome && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleClearDraft}>
                Descartar Borrador
              </Button>
            }
          >
            Se han recuperado datos de un borrador guardado localmente.
          </Alert>
        )}

        {editingIncome && (
          <Typography color="primary" sx={{ mb: 2 }}>
            Editando ingreso ID {editingIncome.id}
          </Typography>
        )}

        <BulkIncomeForm
          key={formKey}
          onSubmit={handleBulkSubmit}
          isLoading={createBulkMutation.isPending || updateMutation.isPending}
          initialValues={bulkInitialValues}
          disableAdd={!!editingIncome}
          isEditMode={!!editingIncome}
          onCancel={() => {
            setEditingIncome(null);
            setFormKey((prev) => prev + 1);
          }}
        />

        {editingIncome && (
          <Box mt={2}>
            <Button
              variant="outlined"
              sx={{
                backgroundColor: "error.main",
                color: "white",
                fontWeight: "bold",
                ":hover": {
                  backgroundColor: "error.light",
                  color: "text.primary",
                },
              }}
              color="error"
              onClick={() => setEditingIncome(null)}
              disabled={updateMutation.isPending}
            >
              Cancelar edición
            </Button>
          </Box>
        )}
      </Paper>

      {isLoading ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={5}>
          <CircularProgress />
          <Typography variant="h6" mt={2}>
            Cargando listado de ingresos...
          </Typography>
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 2, p: 1 }}>
            Historial de Ingresos ({incomes.length})
          </Typography>
          <IncomeTable
            incomes={incomes}
            onEdit={(income) => {
              if (editingIncome) return;
              handleStartEdit(income);
            }}
            onDelete={handleDeleteIncome}
          />
        </Paper>
      )}

      {/* Error real */}
      {isError && !isLoading && (
        <Box p={3} color="error.main">
          <Typography variant="h6" gutterBottom>
            Error al cargar ingresos
          </Typography>
          <Typography variant="body2">Mensaje: {error?.message}</Typography>
        </Box>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default IncomesPage;
