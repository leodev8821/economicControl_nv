import { useState, useMemo, type ChangeEvent } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  TableSortLabel,
  Avatar,
  Chip,
  Stack,
  InputAdornment,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";

// Iconos
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import SecurityIcon from "@mui/icons-material/Security";
import AdminIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import SupervisorIcon from "@mui/icons-material/SupervisorAccount";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";

// Tipos e Importaciones
import type { User } from "../../types/user.type";
import { APPS } from "@/shared/constants/app";

interface UserTableProps {
  users: User[];
  currentUser: User;
  onEdit: (user: User) => void;
  onToggleVisibility: (user: User) => void;
  isLoading?: boolean;
}

type Order = "asc" | "desc";
type OrderBy = keyof User | "fullName";

const APP_LABELS: Record<number, string> = {
  [APPS.ALL]: "Todas",
  [APPS.FINANCE]: "Finanzas",
  [APPS.CONSOLIDATION]: "Consolidación",
};

// Helpers visuales originales
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getRoleConfig = (role: string) => {
  switch (role) {
    case "SuperUser":
      return {
        color: "error" as const,
        icon: <AdminIcon fontSize="small" />,
        label: "SuperUsuario",
      };
    case "Administrador":
      return {
        color: "error" as const,
        icon: <AdminIcon fontSize="small" />,
        label: "Administrador",
      };
    case "Leader":
      return {
        color: "warning" as const,
        icon: <SupervisorIcon fontSize="small" />,
        label: "Líder",
      };
    case "Miembro":
      return {
        color: "info" as const,
        icon: <PersonIcon fontSize="small" />,
        label: "Miembro",
      };
    default:
      return {
        color: "info" as const,
        icon: <PersonIcon fontSize="small" />,
        label: role || "Desconocido",
      };
  }
};

export default function UserTable({
  users,
  currentUser,
  onEdit,
  onToggleVisibility,
  isLoading,
}: UserTableProps) {
  // --- Estados de Paginación y Orden ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<OrderBy>("fullName");
  const [searchText, setSearchText] = useState("");

  // --- Handlers ---
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // --- Lógica de Filtrado Manual ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullSearch =
        `${user.first_name} ${user.last_name} ${user.username} ${user.email}`.toLowerCase();
      return fullSearch.includes(searchText.toLowerCase());
    });
  }, [users, searchText]);

  // --- Lógica de Ordenación Manual ---
  const sortedUsers = useMemo(() => {
    const getValue = (user: User, column: OrderBy) => {
      if (column === "fullName")
        return `${user.first_name} ${user.last_name}`.toLowerCase();
      return (user[column as keyof User] as string | number) ?? "";
    };

    return [...filteredUsers].sort((a, b) => {
      const aValue = getValue(a, orderBy);
      const bValue = getValue(b, orderBy);
      if (bValue < aValue) return order === "desc" ? -1 : 1;
      if (bValue > aValue) return order === "desc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, order, orderBy]);

  const paginatedUsers = useMemo(
    () =>
      sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedUsers, page, rowsPerPage],
  );

  // --- Componente Cabecera Reutilizable ---
  const SortableHeader = ({
    id,
    label,
    align = "left",
  }: {
    id: OrderBy;
    label: string;
    align?: "left" | "right" | "center";
  }) => (
    <TableCell align={align} sx={{ fontWeight: "bold", color: "white" }}>
      <TableSortLabel
        active={orderBy === id}
        direction={orderBy === id ? order : "asc"}
        onClick={() => handleRequestSort(id)}
        sx={{
          "&.MuiTableSortLabel-active": { color: "white" },
          "&.MuiTableSortLabel-root:hover": { color: "white" },
          "& .MuiTableSortLabel-icon": { color: "white !important" },
        }}
      >
        {label}
        {orderBy === id ? (
          <Box component="span" sx={visuallyHidden}>
            {order === "desc" ? "desc" : "asc"}
          </Box>
        ) : null}
      </TableSortLabel>
    </TableCell>
  );

  // FUNCIÓN HELPER PARA VERIFICAR PERMISOS DE EDICIÓN/BORRADO
  const canManageUser = (targetUser: User) => {
    // 1. Nadie (ni SuperUser) se borra a sí mismo desde la tabla (prevención de accidentes)
    if (targetUser.id === currentUser.id) return false;

    // 2. Determinar poder del usuario ACTUAL
    const amISuperUser = currentUser.role_name === "SuperUser";
    const doIHaveGlobalAccess = currentUser.permissions?.some(
      (p: any) => p.application_id === APPS.ALL,
    );

    // 3. Determinar poder del usuario OBJETIVO (Target)
    const isTargetSuperUser = targetUser.role_name === "SuperUser";
    const isTargetGlobalAdmin = targetUser.permissions?.some(
      (p: any) => p.application_id === APPS.ALL,
    );

    // --- REGLAS ---

    // A. SuperUser puede con todo
    if (amISuperUser) return true;

    // B. Si el objetivo es SuperUser, nadie más puede tocarlo
    if (isTargetSuperUser) return false;

    // C. Si soy Admin Global (App 1)
    if (doIHaveGlobalAccess) {
      // Puedo editar a cualquiera que NO sea SuperUser
      return true;
    }

    // D. Si soy Admin de App Específica (ej. Finance)
    // Solo puedo editar si:
    // 1. El objetivo NO es Admin Global
    if (isTargetGlobalAdmin) return false;

    // 2. Compartimos la misma aplicación
    const myApps = (currentUser.permissions || []).map(
      (p: any) => p.application_id,
    );
    const targetApps = (targetUser.permissions || []).map(
      (p: any) => p.application_id,
    );
    const shareApp = myApps.some((myAppId) => targetApps.includes(myAppId));

    if (!shareApp) return false; // No es de mi departamento

    // 3. El objetivo tiene un rol inferior (Lider o Miembro)
    if (targetUser.role_name === "Administrador") return false;

    return true;
  };

  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      {/* Barra de Búsqueda UX IncomeTable */}
      <Paper
        elevation={0}
        sx={{ p: 2, bgcolor: "background.default", borderRadius: 2 }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar usuarios por nombre, email o username..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(0);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: 500, bgcolor: "white" }}
        />
      </Paper>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ "& th": { bgcolor: "primary.main" } }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Usuario
              </TableCell>
              <SortableHeader id="username" label="Username" />
              <SortableHeader id="email" label="Email" />
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Rol
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Accesos
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  Cargando...
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => {
                const role = getRoleConfig(user.role_name);
                const hasPermission = canManageUser(user);
                const isSelf = user.id === currentUser.id;
                const canEdit = hasPermission || isSelf;
                const canDelete = hasPermission;
                const isHidden = !user.is_visible;

                return (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      opacity: isHidden ? 0.6 : 1,
                      bgcolor: isHidden ? "action.hover" : "inherit",
                    }}
                  >
                    {/* Celda con Avatar e Iniciales */}
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: role.color + ".main",
                            opacity: isHidden ? 0.5 : 1,
                            width: 32,
                            height: 32,
                            fontSize: "0.8rem",
                          }}
                        >
                          {getInitials(user.first_name, user.last_name)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            component="span"
                          >
                            {user.first_name} {user.last_name}
                          </Typography>

                          {isHidden && (
                            <Chip
                              label="ELIMINADO"
                              size="small"
                              color="error"
                              sx={{ ml: 1, height: 16, fontSize: "0.6rem" }}
                            />
                          )}
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>

                    {/* Celda de Rol con Icono */}
                    <TableCell>
                      <Chip
                        icon={role.icon}
                        label={role.label}
                        size="small"
                        color={role.color}
                        variant="outlined"
                      />
                    </TableCell>

                    {/* Columna de Accesos */}
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {(() => {
                          const rawPermissions =
                            user.permissions ||
                            (user as any).allowed_apps ||
                            [];

                          // 1. Verificamos si tiene la App ID 1 (ALL) en sus permisos
                          const hasGlobalPermission = rawPermissions.some(
                            (p: any) => (p.application_id ?? p) === APPS.ALL,
                          );

                          // 2. CASO: SUPER ACCESO (SuperUser O Administrador con App ALL)
                          if (
                            user.role_name === "SuperUser" ||
                            (user.role_name === "Administrador" &&
                              hasGlobalPermission)
                          ) {
                            return (
                              <Tooltip title="Este usuario tiene facultades de gestión global">
                                <Chip
                                  icon={
                                    <SecurityIcon style={{ fontSize: 14 }} />
                                  }
                                  label="ACCESO TOTAL"
                                  size="small"
                                  color="secondary"
                                  sx={{
                                    fontSize: "0.7rem",
                                    height: 20,
                                    fontWeight: "bold",
                                    background:
                                      "linear-gradient(45deg, #ed6c02 30%, #ffb74d 90%)",
                                    color: "white",
                                  }}
                                />
                              </Tooltip>
                            );
                          }

                          // 3. CASO: ACCESOS ESPECÍFICOS (Admin de una app, Líder o Miembro)
                          if (rawPermissions.length > 0) {
                            return rawPermissions.map((p: any, idx: number) => {
                              const appId = p.application_id ?? p;

                              // Si por error alguien tiene ID 1 pero no entró en el IF de arriba (casos borde)
                              const isAll = appId === APPS.ALL;

                              return (
                                <Tooltip
                                  key={idx}
                                  title={
                                    isAll
                                      ? "Acceso Global"
                                      : `Administrador de ${APP_LABELS[appId] || "Aplicación"}`
                                  }
                                >
                                  <Chip
                                    icon={
                                      isAll ? (
                                        <SecurityIcon
                                          style={{ fontSize: 14 }}
                                        />
                                      ) : (
                                        <AdminIcon style={{ fontSize: 14 }} />
                                      )
                                    }
                                    label={APP_LABELS[appId] || `App ${appId}`}
                                    size="small"
                                    // Si es Admin, usamos un color más fuerte y variante filled
                                    variant={
                                      user.role_name === "Administrador"
                                        ? "filled"
                                        : "outlined"
                                    }
                                    color={
                                      user.role_name === "Administrador"
                                        ? "primary"
                                        : "default"
                                    }
                                    sx={{
                                      fontSize: "0.7rem",
                                      height: 20,
                                      fontWeight:
                                        user.role_name === "Administrador"
                                          ? "bold"
                                          : "normal",
                                      // Un pequeño sombreado si es admin
                                      boxShadow:
                                        user.role_name === "Administrador"
                                          ? 1
                                          : 0,
                                    }}
                                  />
                                </Tooltip>
                              );
                            });
                          }

                          // 4. FALLBACK: Sin permisos
                          return (
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{ fontStyle: "italic" }}
                            >
                              Sin accesos específicos
                            </Typography>
                          );
                        })()}
                      </Stack>
                    </TableCell>

                    {/* Acciones Manuales */}
                    <TableCell align="center">
                      {/* BOTÓN EDITAR */}
                      <Tooltip
                        title={
                          canEdit
                            ? "Editar"
                            : "No tienes permisos para editar este usuario"
                        }
                      >
                        <span>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => onEdit(user)}
                            disabled={!canEdit}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      {/* Botón para Restaurar o Ocultar */}
                      {currentUser.role_name === "SuperUser" && isHidden ? (
                        <Tooltip title="Restaurar Usuario">
                          <span>
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() => onToggleVisibility(user)}
                            >
                              <RestoreFromTrashIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Eliminar (Ocultar)">
                          <span>
                            <IconButton
                              color="error"
                              onClick={() => onToggleVisibility(user)}
                              disabled={!canDelete}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron usuarios
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas:"
        />
      </TableContainer>
    </Box>
  );
}
