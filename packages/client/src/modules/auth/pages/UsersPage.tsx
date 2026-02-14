import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Paper, Alert } from "@mui/material";
import type { GridRowId } from "@mui/x-data-grid";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@modules/auth/hooks/useUser";
import UserTable from "@modules/auth/components/tables/UserTable";
import UserForm from "@modules/auth/components/UserForm";
import { useAuth } from "@modules/auth/hooks/useAuth";
import type { User } from "@modules/auth/types/user.type";
import * as SharedUserSchema from "@economic-control/shared";

const UserPage: React.FC = () => {
  // 1. Seguridad y Autenticación
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const ALLOWED_ROLES = ["Administrador", "SuperUser"];
  const hasPermission =
    authUser?.role_name && ALLOWED_ROLES.includes(authUser.role_name);

  useEffect(() => {
    if (authUser && !hasPermission) {
      navigate("/dashboard");
    }
  }, [authUser, hasPermission, navigate]);

  // 2. Hooks de Datos (CRUD)
  const { data: users = [], isLoading, isError, error } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  // 3. Estado local para Edición
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // 4. Manejadores (Handlers)

  // Crear
  const handleCreateUser = async (
    data: SharedUserSchema.UserCreationRequest,
  ) => {
    try {
      await createMutation.mutateAsync(data);
    } catch (error) {
      //console.error("Error en Create:", error);
      throw error;
    }
  };

  // Actualizar
  const handleUpdateUser = async (data: User) => {
    try {
      await updateMutation.mutateAsync(data);
      setEditingUser(null);
    } catch (error) {
      //console.error("Error en Update:", error);
      throw error;
    }
  };

  // Switcher para el Formulario
  const handleFormSubmit = async (data: any) => {
    if (editingUser) {
      return await handleUpdateUser({ ...data, id: editingUser.id });
    } else {
      return await handleCreateUser(data);
    }
  };

  // Iniciar Edición (viene desde la Tabla)
  const handleStartEdit = (userToEdit: User) => {
    setEditingUser(userToEdit);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancelar Edición
  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  // Eliminar
  const handleDeleteUser = (id: GridRowId) => {
    const userId = parseInt(id.toString());

    // Evitar que uno se borre a sí mismo (seguridad extra visual)
    if (userId === authUser?.id) {
      alert("No puedes eliminar tu propio usuario.");
      return;
    }

    if (
      window.confirm(
        `¿Está seguro de eliminar al Usuario con ID ${userId}? Esta acción es irreversible.`,
      )
    ) {
      deleteMutation.mutate(userId);
    }
  };

  // Si no tiene permiso, retornamos null (el useEffect redirigirá)
  if (!authUser || !hasPermission) return null;

  return (
    <Box p={3}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Gestión de Usuarios
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Panel de administración para {authUser.role_name}
        </Typography>
      </Box>

      {/* Indicador de mutación (Feedback visual) */}
      {(deleteMutation.isPending ||
        updateMutation.isPending ||
        createMutation.isPending) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Procesando solicitud en el servidor...
        </Alert>
      )}

      {/* === SECCIÓN FORMULARIO === */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: "background.paper" }}>
        <Typography variant="h6" color="secondary" gutterBottom>
          {editingUser
            ? `Editando Usuario: ${editingUser.username}`
            : "Crear Nuevo Usuario"}
        </Typography>
        <UserForm
          key={editingUser ? `edit-${editingUser.id}` : "new-user"}
          initialValues={editingUser}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          isUpdateMode={!!editingUser}
          onCancel={handleCancelEdit}
        />
      </Paper>

      {/* === SECCIÓN LISTADO === */}

      {/* Loading State */}
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress />
          <Typography variant="h6" ml={2}>
            Cargando usuarios...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <Box p={3} color="error.main">
          <Typography variant="h6" gutterBottom>
            Error al cargar usuarios
          </Typography>
          <Typography variant="body2">Mensaje: {error?.message}</Typography>
        </Box>
      )}

      {/* Empty State */}
      {!isLoading && !isError && users.length === 0 && (
        <Alert severity="info">
          No hay usuarios registrados en el sistema.
        </Alert>
      )}

      {/* Table */}
      {!isLoading && !isError && users.length > 0 && (
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
            mb={2}
            p={2}
          >
            <Typography variant="h5">
              Listado de Usuarios ({users.length})
            </Typography>
          </Box>

          <UserTable
            users={users}
            onEdit={handleStartEdit}
            onDelete={handleDeleteUser}
            isLoading={isLoading}
          />
        </Paper>
      )}
    </Box>
  );
};
export default UserPage;
