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
import AppsIcon from "@mui/icons-material/Apps";

// Tipos e Importaciones
import type { User } from "../../types/user.type";
import { APPS } from "@/shared/constants/app";

interface UserTableProps {
  users: User[];
  currentUser: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
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
    case "ADMIN":
      return {
        color: "error" as const,
        icon: <AdminIcon fontSize="small" />,
        label: "Admin",
      };
    case "SUPERVISOR":
      return {
        color: "warning" as const,
        icon: <SupervisorIcon fontSize="small" />,
        label: "Sup.",
      };
    default:
      return {
        color: "info" as const,
        icon: <PersonIcon fontSize="small" />,
        label: "User",
      };
  }
};

export default function UserTable({
  users,
  currentUser,
  onEdit,
  onDelete,
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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
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
                const isSelf = currentUser.id === user.id;
                const canEdit =
                  !isSelf ||
                  currentUser.role_name === "Administrador" ||
                  currentUser.role_name === "SuperUser";
                const canDelete = !isSelf;

                return (
                  <TableRow key={user.id} hover>
                    {/* Celda con Avatar e Iniciales */}
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: role.color + ".main",
                            width: 32,
                            height: 32,
                            fontSize: "0.8rem",
                          }}
                        >
                          {getInitials(user.first_name, user.last_name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {user.first_name} {user.last_name}
                          </Typography>
                          {user.id === currentUser.id && (
                            <Typography variant="caption" color="primary">
                              (Tú)
                            </Typography>
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
                          // 1. Fuentes posibles según tus archivos:
                          // En UserForm usas 'permissions' y cada item tiene 'application_id'
                          const rawPermissions =
                            user.permissions ||
                            (user as any).allowed_apps ||
                            [];

                          // 2. Lógica de Oro: Si el rol es Administrador o SuperUser, tiene TODO.
                          // Basado en tu UsersPage.tsx, usas "role_name" para validar.
                          const isAdmin =
                            user.role_name === "Administrador" ||
                            user.role_name === "SuperUser";
                          if (isAdmin) {
                            return (
                              <Tooltip title="Este usuario tiene acceso a todas las aplicaciones por su rol">
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

                          // 3. Si no es admin y no hay nada en la lista
                          if (rawPermissions.length === 0) {
                            return (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                                sx={{ fontStyle: "italic" }}
                              >
                                Sin accesos específicos
                              </Typography>
                            );
                          }

                          // 4. Renderizado normal para usuarios estándar
                          return rawPermissions.map((p: any, idx: number) => {
                            const appId = p.application_id ?? p;
                            return (
                              <Tooltip
                                key={idx}
                                title={APP_LABELS[appId] || "Aplicación"}
                              >
                                <Chip
                                  icon={<AppsIcon style={{ fontSize: 14 }} />}
                                  label={APP_LABELS[appId] || `App ${appId}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: "0.7rem", height: 20 }}
                                />
                              </Tooltip>
                            );
                          });
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

                      {/* BOTÓN ELIMINAR (Mantenemos el bloqueo por seguridad propia) */}
                      <Tooltip
                        title={
                          canDelete
                            ? "Eliminar"
                            : "No puedes eliminar tu propia cuenta"
                        }
                      >
                        <span>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => onDelete(user.id)}
                            disabled={!canDelete}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
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
