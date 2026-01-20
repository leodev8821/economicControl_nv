import React, { useState } from "react";
import {
  useReadIncomes,
  useCreateIncome,
  useDeleteIncome,
  useUpdateIncome,
  useCreateBulkIncome,
} from "../hooks/useIncome";
import IncomeTable from "../components/tables/IncomeTable";
import IncomeForm from "../components/forms/IncomeForm";
import BulkIncomeForm from "../components/forms/BulkIncomeForm";
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
import type { Income } from "../types/income.type";
import { parseWithZod } from "@conform-to/zod/v4";
import * as SharedIncomeSchemas from "@economic-control/shared";

export const IncomesPage: React.FC = () => {
  const { data: incomes = [], isLoading } = useReadIncomes();

  const createMutation = useCreateIncome();
  const deleteMutation = useDeleteIncome();
  const updateMutation = useUpdateIncome();
  const createBulkMutation = useCreateBulkIncome();

  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [tabValue, setTabValue] = useState(0); // 0: Individual, 1: Masivo

  // --- Lógica de Bulk ---
  const handleBulkSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Validamos con el schema de Bulk
    const submission = parseWithZod(formData, {
      schema: SharedIncomeSchemas.BulkIncomeSchema,
    });

    if (submission.status !== "success") return;

    const payload = submission.value.incomes.map((item) => ({
      ...item,
      week_id: submission.value.common_week_id, // Inyectamos el ID global
      person_id: item.person_id || null, // Limpieza de datos
    }));

    createBulkMutation.mutate(payload, {
      onSuccess: () => {
        setTabValue(0); // Volver a la tabla tras éxito
      },
    });
  };

  // --- Lógica Individual ---
  const handleFormSubmit = (
    data: SharedIncomeSchemas.IncomeCreationRequest,
  ) => {
    if (editingIncome) {
      updateMutation.mutate(
        { ...data, id: editingIncome.id },
        {
          onSuccess: () => setEditingIncome(null),
        },
      );
    } else {
      createMutation.mutate(data);
    }
  };

  const handleStartEdit = (income: Income) => {
    setEditingIncome(income);
    setTabValue(0); // Forzamos el tab individual al editar
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteIncome = (id: GridRowId) => {
    const incomeId = parseInt(id.toString());
    if (
      window.confirm(`¿Está seguro de eliminar el Ingreso con ID ${incomeId}?`)
    ) {
      deleteMutation.mutate(incomeId);
    }
  };

  // 1. Renderizado Principal
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Gestión de Ingresos
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
          <IncomeForm
            initialValues={editingIncome}
            onSubmit={handleFormSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
            isUpdateMode={!!editingIncome}
            onCancel={() => setEditingIncome(null)} // Usamos la lógica inline aquí
          />
        ) : (
          <BulkIncomeForm
            onSubmit={handleBulkSubmit}
            isLoading={createBulkMutation.isPending}
          />
        )}
      </Paper>

      {isLoading ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={5}>
          <CircularProgress />
          <Typography variant="h6" mt={2}>
            Cargando datos...
          </Typography>
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 2, p: 1 }}>
            Historial de Movimientos ({incomes.length})
          </Typography>
          <IncomeTable
            incomes={incomes}
            onEdit={handleStartEdit}
            onDelete={handleDeleteIncome}
          />
        </Paper>
      )}
    </Box>
  );
};
