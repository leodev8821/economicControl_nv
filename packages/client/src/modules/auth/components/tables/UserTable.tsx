import React from "react";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import {
  Box,
  Chip,
  Avatar,
  Typography,
  Tooltip,
  Stack,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  SupervisorAccount as SupervisorIcon,
  Apps as AppsIcon,
} from "@mui/icons-material";

// Importamos el tipo desde tu definición
import type { User } from "../../types/user.type";
import { APPS } from "@/shared/constants/app";

// --- MAPEO DE NOMBRES ---
const APP_LABELS: Record<number, string> = {
  [APPS.ALL]: "Todas las aplicaciones",
  [APPS.FINANCE]: "Finanzas",
  [APPS.CONSOLIDATION]: "Consolidación",
};

interface UserTableProps {
  users: User[];
  currentUser: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

// Helper para obtener las iniciales
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Helper para color y avatar según el rol global
const getRoleConfig = (role: string) => {
  switch (role) {
    case "Administrador":
      return { color: "error", icon: <AdminIcon fontSize="small" /> };
    case "SuperUser":
      return { color: "warning", icon: <SupervisorIcon fontSize="small" /> };
    case "Leader":
      return { color: "info", icon: <SecurityIcon fontSize="small" /> };
    default:
      return { color: "default", icon: <PersonIcon fontSize="small" /> };
  }
};

const UserTable: React.FC<UserTableProps> = ({
  users,
  currentUser,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const theme = useTheme();

  const columns: GridColDef<User>[] = [
    // 1. ID (Opcional, útil para debug o referencia rápida)
    { field: "id", headerName: "ID", width: 70 },

    // 2. Usuario (Avatar + Username)
    {
      field: "username",
      headerName: "Usuario",
      width: 200,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ height: "100%" }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: 14,
              bgcolor: theme.palette.primary.main,
            }}
          >
            {getInitials(params.row.first_name, params.row.last_name)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.value}
            </Typography>
          </Box>
        </Stack>
      ),
    },

    // 3. Nombre Completo
    {
      field: "fullName",
      headerName: "Nombre Completo",
      width: 220,
      valueGetter: (_value, row) => `${row.first_name} ${row.last_name}`,
    },

    // 4. Rol Global (Chip visual)
    {
      field: "role_name",
      headerName: "Rol Global",
      width: 160,
      renderCell: (params: GridRenderCellParams<User>) => {
        const config = getRoleConfig(params.value as string);
        return (
          <Chip
            icon={config.icon}
            label={params.value}
            // @ts-ignore: Mui Chip color supports strict union
            color={config.color as any}
            size="small"
            variant="outlined"
            sx={{ fontWeight: "bold" }}
          />
        );
      },
    },

    // 5. Contacto (Email)
    {
      field: "email",
      headerName: "Email",
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" color="textSecondary">
          {params.value || "Sin email"}
        </Typography>
      ),
    },

    // --- COLUMNA DE PERMISOS ---
    {
      field: "permissions",
      headerName: "Accesos (Apps)",
      width: 180,
      renderCell: (params: GridRenderCellParams<User>) => {
        const row = params.row as any;
        const perms = row.permissions || row.Permissions || [];

        const count = perms.length;

        if (count === 0) {
          return (
            <Typography variant="caption" color="text.disabled">
              Sin accesos
            </Typography>
          );
        }

        const tooltipText = (
          <Box sx={{ p: 0.5 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, borderBottom: "1px solid rgba(255,255,255,0.2)" }}
            >
              Aplicaciones Habilitadas:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 15 }}>
              {perms.map((p: any, index: number) => {
                // Buscamos el nombre en el mapa APP_LABELS usando application_id
                const appName =
                  APP_LABELS[p.application_id] || `App #${p.application_id}`;
                return (
                  <li key={index} style={{ marginBottom: 4 }}>
                    <strong>{appName}</strong>
                  </li>
                );
              })}
            </ul>
          </Box>
        );

        return (
          <Tooltip title={tooltipText} arrow placement="left">
            <Chip
              icon={<AppsIcon style={{ fontSize: 16 }} />}
              label={`${count} ${count === 1 ? "App" : "Apps"}`}
              size="small"
              color="primary"
              variant="filled"
              sx={{ cursor: "help" }}
            />
          </Tooltip>
        );
      },
    },

    // 7. Acciones
    {
      field: "actions",
      type: "actions",
      headerName: "Acciones",
      width: 120,
      getActions: (params) => {
        const targetUser = params.row;

        const isTargetSuperUser = targetUser.role_name === "SuperUser";
        const isCurrentSuperUser = currentUser.role_name === "SuperUser";
        const isCurrentAdmin = currentUser.role_name === "Administrador";
        const isSelf = currentUser.id === targetUser.id;

        // Regla de permisos
        const canModify =
          isCurrentSuperUser ||
          (isCurrentAdmin && !isTargetSuperUser && !isSelf);

        const disabledReason = isTargetSuperUser
          ? "Un Administrador no puede modificar un SuperUser"
          : "No tienes permisos";

        return [
          <Tooltip key="edit-tooltip" title={!canModify ? disabledReason : ""}>
            <span>
              <GridActionsCellItem
                icon={<EditIcon />}
                label="Editar"
                onClick={() => onEdit(params.row)}
                disabled={!canModify}
              />
            </span>
          </Tooltip>,

          <Tooltip
            key="delete-tooltip"
            title={!canModify ? disabledReason : ""}
          >
            <span>
              <GridActionsCellItem
                icon={<DeleteIcon color="error" />}
                label="Eliminar"
                onClick={() => onDelete(params.row.id)}
                disabled={!canModify}
              />
            </span>
          </Tooltip>,
        ];
      },
    },
  ];

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={users}
        columns={columns}
        loading={isLoading}
        showToolbar={true}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        disableRowSelectionOnClick
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        sx={{
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          boxShadow: 2,
          border: 2,
          borderColor: "divider",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "background.default",
            fontSize: "1rem",
          },
        }}
      />
    </Box>
  );
};

export default UserTable;
