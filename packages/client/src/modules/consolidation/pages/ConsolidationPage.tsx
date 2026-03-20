import { Box, Paper, Typography, Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";

import NetworkForm from "../components/forms/NetworkForm";
import NetworkTable from "../components/tables/NetworkTable";
import ConsolidationTable from "../components/tables/ConsolidationTable";

import useNetworkController from "../hooks/useNetworkController";

export default function ConsolidationPage() {
  const controller = useNetworkController();

  return (
    <Box p={3}>
      <Paper ref={controller.formRef} sx={{ p: 3, mb: 4 }}>
        <NetworkForm
          onSubmit={controller.handleFormSubmit}
          isLoading={controller.isLoading}
          initialValues={controller.editingNetwork ?? undefined}
          isEditMode={!!controller.editingNetwork}
          onCancel={controller.cancelEdit}
        />
      </Paper>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Directorio de Redes ({controller.networks.length})
        </Typography>

        <NetworkTable
          rows={controller.networks}
          onEdit={controller.startEdit}
          onToggleVisibility={controller.toggleVisibility}
        />
      </Paper>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Consolidación
        </Typography>

        <ConsolidationTable />
      </Paper>

      <Snackbar
        open={controller.snackbar.open}
        autoHideDuration={3000}
        onClose={() => controller.setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert severity={controller.snackbar.severity} variant="filled">
          {controller.snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
