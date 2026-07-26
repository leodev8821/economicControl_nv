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

import useMemberController from "@modules/consolidation/controllers/useMemberController";
import MemberTable from "@modules/consolidation/components/tables/MemberTable";
import MemberForm from "@modules/consolidation/components/forms/MemberForm";

import type { UserType } from "@economic-control/shared";
import type { Member } from "@modules/consolidation/types/member.type";

export default function MembersPage() {
  const controller = useMemberController();

  return (
    <Box p={3}>
      {/* Indicador de mutación en curso */}
      {controller.isLoading && (
        <Typography color="primary" sx={{ mb: 2 }}>
          Realizando acción en el servidor...
        </Typography>
      )}

      {controller.editingMember && (
        <Alert
          severity="info"
          sx={{ mb: 3, position: "sticky", top: 0, zIndex: 10 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => controller.setEditingMember(null)}
            >
              Cancelar
            </Button>
          }
        >
          Estás editando la nueva persona {controller.editingMember.first_name}{" "}
          {controller.editingMember.last_name}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Gestión de Nuevas Personas
      </Typography>

      {/* Alertas de Error Consolidadas */}
      {controller.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Hubo un problema al procesar la solicitud. Por favor, intente de
          nuevo.
        </Alert>
      )}

      <Paper
        id="member-form"
        ref={controller.formRef}
        elevation={3}
        sx={{ p: 3, mb: 4, bgcolor: "background.paper" }}
      >
        {controller.draft && !controller.editingMember && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={controller.handleClearDraft}
              >
                Descartar Borrador
              </Button>
            }
          >
            Se han recuperado datos de un borrador guardado localmente.
          </Alert>
        )}

        <MemberForm
          key={controller.formKey}
          onSubmit={controller.handleFormSubmit}
          isLoading={controller.isLoading}
          initialValues={controller.formInitialValues}
          disableAdd={!!controller.editingMember}
          isEditMode={!!controller.editingMember}
          onCancel={() => {
            controller.setEditingMember(null);
            controller.setFormKey((prev) => prev + 1);
          }}
        />
      </Paper>

      {controller.isLoading ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={5}>
          <CircularProgress />
          <Typography variant="h6" mt={2}>
            Cargando listado de nuevas personas...
          </Typography>
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" color="secondary" sx={{ mb: 2, p: 1 }}>
            Directorio de Nuevas Personas
          </Typography>
          {controller.currentUser ? (
            <MemberTable
              members={controller.members as Member[]}
              currentUser={controller.currentUser as UserType}
              highlightedRowId={controller.editingMember?.id}
              onEdit={(member) => {
                if (controller.editingMember) return;
                controller.handleStartEdit(member);
              }}
              onToggleVisibility={controller.handleToggleVisibility}
            />
          ) : (
            <Typography p={2}>Cargando permisos de usuario...</Typography>
          )}
        </Paper>
      )}

      {/* Error real */}
      {controller.isError && !controller.isLoading && (
        <Box p={3} color="error.main">
          <Typography variant="h6" gutterBottom>
            Error al cargar nuevas personas
          </Typography>
          <Typography variant="body2">
            Mensaje: {controller.error?.message}
          </Typography>
        </Box>
      )}

      <Snackbar
        open={controller.snackbar.open}
        autoHideDuration={3000}
        onClose={() => controller.setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert
          severity={controller.snackbar.severity}
          variant="filled"
          onClose={() => controller.setSnackbar((s) => ({ ...s, open: false }))}
        >
          {controller.snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
