import React, { useState, useEffect, useRef } from "react";
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
  useReadMembers,
  useUpdateMember,
  useDeleteMember,
  useCreateBulkMembers,
} from "@modules/consolidation/hooks/useMember";
import MemberTable from "@modules/consolidation/components/tables/MemberTable";
import MemberForm from "@modules/consolidation/components/forms/MemberForm";
import type { Member } from "@modules/consolidation/types/member.type";
import * as SharedMemberSchemas from "@economic-control/shared";

const MembersPage: React.FC = () => {
  const [formKey, setFormKey] = useState(0);
  const [draft, setDraft] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Hooks de React Query
  const { data: members = [], isLoading, isError, error } = useReadMembers();
  const deleteMutation = useDeleteMember();
  const updateMutation = useUpdateMember();
  const createBulkMutation = useCreateBulkMembers();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedDraft = localStorage.getItem("members_draft");
    if (savedDraft && !editingMember) {
      setDraft(JSON.parse(savedDraft));
      setFormKey((prev) => prev + 1);
    }
  }, [editingMember]);

  const handleClearDraft = () => {
    localStorage.removeItem("members_draft");
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

  // --- Lógica de Formulario ---
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const submission = parseWithZod(formData, {
      schema: SharedMemberSchemas.BulkMemberSchema,
    });

    if (submission.status !== "success") {
      console.log("Errores de validación:", submission.reply());
      return;
    }

    const payload = submission.value.members;

    // Modo edición → update
    if (editingMember) {
      updateMutation.mutate(
        { ...payload[0], id: editingMember.id },
        {
          onSuccess: () => {
            setEditingMember(null);
            setFormKey((prev) => prev + 1);
            showSnackbar("Miembro actualizado correctamente");
          },
          onError: () => showSnackbar("Error al actualizar", "error"),
        },
      );
      return;
    }

    // Modo creación (Bulk o Single)
    createBulkMutation.mutate(payload, {
      onSuccess: () => {
        localStorage.removeItem("members_draft");
        setDraft(null);
        setEditingMember(null);
        setFormKey((prev) => prev + 1);
        showSnackbar("Miembros registrados correctamente");
      },
      onError: () => showSnackbar("Error al guardar", "error"),
    });
  };

  const handleStartEdit = (member: Member) => {
    setEditingMember(member);
    setFormKey((prev) => prev + 1);
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleDeleteMember = (id: number) => {
    if (window.confirm(`¿Está seguro de eliminar el Miembro con ID ${id}?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => showSnackbar("Miembro eliminado"),
        onError: () => showSnackbar("Error al eliminar", "error"),
      });
    }
  };

  const formInitialValues = editingMember
    ? { members: [editingMember] }
    : draft
      ? draft
      : undefined;

  return (
    <Box p={3}>
      {/* Indicador de mutación en curso */}
      {(deleteMutation.isPending || updateMutation.isPending) && (
        <Typography color="primary" sx={{ mb: 2 }}>
          Realizando acción en el servidor...
        </Typography>
      )}

      {editingMember && (
        <Alert
          severity="info"
          sx={{ mb: 3, position: "sticky", top: 0, zIndex: 10 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setEditingMember(null)}
            >
              Cancelar
            </Button>
          }
        >
          Estás editando el miembro ID {editingMember.id}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Gestión de Miembros
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
        {draft && !editingMember && (
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

        {editingMember && (
          <Typography color="primary" sx={{ mb: 2 }}>
            Editando miembro ID {editingMember.id}
          </Typography>
        )}

        <MemberForm
          key={formKey}
          onSubmit={handleFormSubmit}
          isLoading={createBulkMutation.isPending || updateMutation.isPending}
          initialValues={formInitialValues}
          disableAdd={!!editingMember}
          isEditMode={!!editingMember}
          onCancel={() => {
            setEditingMember(null);
            setFormKey((prev) => prev + 1);
          }}
        />
      </Paper>

      {isLoading ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={5}>
          <CircularProgress />
          <Typography variant="h6" mt={2}>
            Cargando listado de miembros...
          </Typography>
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 2, p: 1 }}>
            Directorio de Miembros ({members.length})
          </Typography>
          <MemberTable
            members={members}
            highlightedRowId={editingMember?.id}
            onEdit={(member) => {
              if (editingMember) return;
              handleStartEdit(member);
            }}
            onDelete={handleDeleteMember}
          />
        </Paper>
      )}

      {/* Error real */}
      {isError && !isLoading && (
        <Box p={3} color="error.main">
          <Typography variant="h6" gutterBottom>
            Error al cargar miembros
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

export default MembersPage;
