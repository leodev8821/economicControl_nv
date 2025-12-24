import React, { useState } from "react";
import {
  useCashes,
  useCreateCash,
  useUpdateCash,
  useDeleteCash,
} from "../hooks/useCash";
import CashTable from "../components/tables/CashTable";
import CashForm from "../components/forms/CashForm";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import type { GridRowId } from "@mui/x-data-grid";
import type { Cash } from "../types/cash.type";
import type { CashUpdateData } from "../api/cashApi";
import * as SharedCashSchemas from "@economic-control/shared";

export const CashesPage: React.FC = () => {
  const { data: cashes = [], isLoading, isError, error } = useCashes();
  const createMutation = useCreateCash();
  const updateMutation = useUpdateCash();
  const deleteMutation = useDeleteCash();

  const [editingCash, setEditingCash] = useState<Cash | null>(null);

  const handleCreateCash = (
    cashData: SharedCashSchemas.CashCreationRequest
  ) => {
    createMutation.mutate(cashData, {
      onSuccess: () => {
        // Success logic handled by hook (invalidation)
      },
    });
  };

  const handleUpdateCash = (cashData: CashUpdateData) => {
    updateMutation.mutate(cashData, {
      onSuccess: () => {
        setEditingCash(null);
      },
    });
  };

  const handleFormSubmit = (data: SharedCashSchemas.CashCreationRequest) => {
    if (editingCash) {
      handleUpdateCash({ ...data, id: editingCash.id });
    } else {
      handleCreateCash(data);
    }
  };

  const handleStartEdit = (cash: Cash) => {
    setEditingCash(cash);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingCash(null);
  };

  const handleDeleteCash = (id: GridRowId) => {
    const cashId = parseInt(id.toString());

    if (
      window.confirm(
        `¿Está seguro de eliminar la Caja con ID ${cashId}? Esta acción es irreversible.`
      )
    ) {
      deleteMutation.mutate(cashId);
    }
  };

  return (
    <Box p={3}>
      {/* Indicador de que una mutación está en curso */}
      {(createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending) && (
        <Typography color="primary">
          Realizando acción en el servidor...
        </Typography>
      )}

      {/* Mensaje de error si la eliminación o actualización falló */}
      {(createMutation.isError ||
        updateMutation.isError ||
        deleteMutation.isError) && (
        <Typography color="error.main">
          Error:{" "}
          {createMutation.error?.message ||
            updateMutation.error?.message ||
            deleteMutation.error?.message}
        </Typography>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: "background.paper" }}>
        <CashForm
          initialValues={editingCash}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          isUpdateMode={!!editingCash}
          onCancel={handleCancelEdit}
        />
      </Paper>

      {/* Sección Condicional: Loading / Error / Tabla / Vacío */}
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress />
          <Typography variant="h6" ml={2}>
            Cargando listado de cajas...
          </Typography>
        </Box>
      )}

      {/* Error real */}
      {isError && !isLoading && (
        <Box p={3} color="error.main">
          <Typography variant="h6" gutterBottom>
            Error al cargar cajas
          </Typography>
          <Typography variant="body2">Mensaje: {error?.message}</Typography>
        </Box>
      )}

      {/* Lista vacía */}
      {!isLoading && !isError && cashes.length === 0 && (
        <Typography variant="body1">
          No hay cajas registradas en este momento.
        </Typography>
      )}

      {/* Tabla */}
      {!isLoading && !isError && cashes.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            p: 1,
            borderRadius: 2,
            width: "100%",
            maxWidth: "1200px",
            mx: "auto",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h4">
              Listado de Cajas ({cashes.length})
            </Typography>
          </Box>
          <CashTable
            cashes={cashes}
            onEdit={handleStartEdit}
            onDelete={handleDeleteCash}
          />
        </Paper>
      )}
    </Box>
  );
};
