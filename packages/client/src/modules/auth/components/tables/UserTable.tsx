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
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import SecurityIcon from "@mui/icons-material/Security";
import AdminIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import SupervisorIcon from "@mui/icons-material/SupervisorAccount";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";

import type { UserType } from "@economic-control/shared";
import { APPS } from "@/shared/constants/app";

interface UserTableProps {
  users: UserType[];
  currentUser: UserType;
  onEdit: (user: UserType) => void;
  onToggleVisibility: (user: UserType) => void;
  isLoading?: boolean;
}

type Order = "asc" | "desc";
type OrderBy = keyof UserType | "fullName";

const APP_LABELS: Record<number, string> = {
  [APPS.ALL]: "Todas",
  [APPS.FINANCE]: "Finanzas",
  [APPS.CONSOLIDATION]: "Consolidación",
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getRoleConfig = (role: string) => {
  switch (role) {
    case "SuperUser":
      return { color: "error" as const, icon: <AdminIcon fontSize="small" />, label: "SuperUsuario" };
    case "Administrador":
      return { color: "error" as const, icon: <AdminIcon fontSize="small" />, label: "Administrador" };
    case "Leader":
      return { color: "warning" as const, icon: <SupervisorIcon fontSize="small" />, label: "Líder" };
    case "Miembro":
      return { color: "info" as const, icon: <PersonIcon fontSize="small" />, label: "Miembro" };
    default:
      return { color: "info" as const, icon: <PersonIcon fontSize="small" />, label: role || "Desconocido" };
  }
};

export default function UserTable({
  users,
  currentUser,
  onEdit,
  onToggleVisibility,
  isLoading,
}: UserTableProps) {
  const isMobile = useMediaQuery("(max-width: 899px) and (orientation: portrait), (max-height: 500px) and (orientation: landscape)");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<OrderBy>("fullName");
  const [searchText, setSearchText] = useState("");

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

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullSearch = `${user.first_name} ${user.last_name} ${user.username} ${user.email}`.toLowerCase();
      return fullSearch.includes(searchText.toLowerCase());
    });
  }, [users, searchText]);

  const sortedUsers = useMemo(() => {
    const getValue = (user: UserType, column: OrderBy) => {
      if (column === "fullName") return `${user.first_name} ${user.last_name}`.toLowerCase();
      return (user[column as keyof UserType] as string | number) ?? "";
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
    () => sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedUsers, page, rowsPerPage],
  );

  const SortableHeader = ({ id, label, align = "left" }: { id: OrderBy; label: string; align?: "left" | "right" | "center" }) => (
    <TableCell align={align} sx={{ fontWeight: "bold", color: "white" }}>
      <TableSortLabel
        active={orderBy === id}
        direction={orderBy === id ? order : "asc"}
        onClick={() => handleRequestSort(id)}
        sx={{ "&.MuiTableSortLabel-active": { color: "white" }, "&.MuiTableSortLabel-root:hover": { color: "white" }, "& .MuiTableSortLabel-icon": { color: "white !important" } }}
      >
        {label}
        {orderBy === id ? <Box component="span" sx={visuallyHidden}>{order === "desc" ? "desc" : "asc"}</Box> : null}
      </TableSortLabel>
    </TableCell>
  );

  const canManageUser = (targetUser: UserType) => {
    if (targetUser.id === currentUser.id) return false;

    const amISuperUser = currentUser.role_name === "SuperUser";
    const doIHaveGlobalAccess = currentUser.permissions?.some((p: any) => p.application_id === APPS.ALL);
    const isTargetSuperUser = targetUser.role_name === "SuperUser";

    if (amISuperUser) return true;
    if (isTargetSuperUser) return false;
    if (doIHaveGlobalAccess) return true;

    const isTargetGlobalAdmin = targetUser.permissions?.some((p: any) => p.application_id === APPS.ALL);
    if (isTargetGlobalAdmin) return false;

    const myApps = (currentUser.permissions || []).map((p: any) => p.application_id);
    const targetApps = (targetUser.permissions || []).map((p: any) => p.application_id);
    const shareApp = myApps.some((myAppId) => targetApps.includes(myAppId));

    if (!shareApp) return false;
    if (targetUser.role_name === "Administrador") return false;

    return true;
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: "background.default", borderRadius: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar usuarios..."
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setPage(0); }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> } }}
          sx={{ bgcolor: "white" }}
        />
      </Paper>

      {isMobile ? (
        <Box>
          {isLoading ? (
            <Paper sx={{ p: 3, textAlign: "center" }}><Typography>Cargando...</Typography></Paper>
          ) : paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => {
              const role = getRoleConfig(user.role_name);
              const hasPermission = canManageUser(user);
              const isSelf = user.id === currentUser.id;
              const canEdit = hasPermission || isSelf;
              const canDelete = hasPermission;
              const isHidden = !user.is_visible;

              return (
                <Card key={user.id} sx={{ mb: 1, opacity: isHidden ? 0.6 : 1 }}>
                  <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                      <Avatar sx={{ bgcolor: role.color + ".main", width: 40, height: 40 }}>
                        {getInitials(user.first_name, user.last_name)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {user.first_name} {user.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{user.username}
                        </Typography>
                      </Box>
                      <Chip icon={role.icon} label={role.label} size="small" color={role.color} />
                    </Stack>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Email:</strong> {user.email}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {(() => {
                        const rawPermissions = user.permissions || (user as any).allowed_apps || [];
                        if (rawPermissions.length > 0) {
                          return rawPermissions.map((p: any, idx: number) => {
                            const appId = p.application_id ?? p;
                            return <Chip key={idx} label={APP_LABELS[appId] || `App ${appId}`} size="small" variant="outlined" />;
                          });
                        }
                        return <Typography variant="caption">Sin accesos específicos</Typography>;
                      })()}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                    <Tooltip title={canEdit ? "Editar" : "Sin permisos"}>
                      <span>
                        <IconButton color="primary" size="small" onClick={() => onEdit(user)} disabled={!canEdit}>
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    {currentUser.role_name === "SuperUser" && isHidden ? (
                      <Tooltip title="Restaurar">
                        <IconButton color="success" size="small" onClick={() => onToggleVisibility(user)}>
                          <RestoreFromTrashIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={canDelete ? "Eliminar" : "Sin permisos"}>
                        <span>
                          <IconButton color="error" size="small" onClick={() => onToggleVisibility(user)} disabled={!canDelete}>
                            <DeleteIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </CardActions>
                </Card>
              );
            })
          ) : (
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">No se encontraron usuarios</Typography>
            </Paper>
          )}

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
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ "& th": { bgcolor: "primary.main" } }}>
                <SortableHeader id="fullName" label="Usuario" />
                <SortableHeader id="username" label="Username" />
                <SortableHeader id="email" label="Email" />
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Rol</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Accesos</TableCell>
                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>Cargando...</TableCell>
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
                    <TableRow key={user.id} hover sx={{ opacity: isHidden ? 0.6 : 1, bgcolor: isHidden ? "action.hover" : "inherit" }}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: role.color + ".main", width: 32, height: 32, fontSize: "0.8rem" }}>
                            {getInitials(user.first_name, user.last_name)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {user.first_name} {user.last_name}
                            </Typography>
                            {isHidden && <Chip label="ELIMINADO" size="small" color="error" sx={{ height: 16, fontSize: "0.6rem" }} />}
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>{user.username}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{user.email}</TableCell>

                      <TableCell>
                        <Chip icon={role.icon} label={role.label} size="small" color={role.color} variant="outlined" />
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {(() => {
                            const rawPermissions = user.permissions || (user as any).allowed_apps || [];
                            const hasGlobalPermission = rawPermissions.some((p: any) => (p.application_id ?? p) === APPS.ALL);

                            if (user.role_name === "SuperUser" || (user.role_name === "Administrador" && hasGlobalPermission)) {
                              return (
                                <Tooltip title="Acceso Global">
                                  <Chip icon={<SecurityIcon style={{ fontSize: 14 }} />} label="ACCESO TOTAL" size="small" color="secondary" sx={{ fontSize: "0.7rem", height: 20 }} />
                                </Tooltip>
                              );
                            }

                            if (rawPermissions.length > 0) {
                              return rawPermissions.map((p: any, idx: number) => {
                                const appId = p.application_id ?? p;
                                return (
                                  <Tooltip key={idx} title={APP_LABELS[appId] || `App ${appId}`}>
                                    <Chip label={APP_LABELS[appId] || `App ${appId}`} size="small" variant="outlined" sx={{ fontSize: "0.7rem", height: 20 }} />
                                  </Tooltip>
                                );
                              });
                            }
                            return <Typography variant="caption" color="text.disabled">Sin accesos</Typography>;
                          })()}
                        </Stack>
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title={canEdit ? "Editar" : "Sin permisos"}>
                          <span>
                            <IconButton color="primary" size="small" onClick={() => onEdit(user)} disabled={!canEdit}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        {currentUser.role_name === "SuperUser" && isHidden ? (
                          <Tooltip title="Restaurar">
                            <IconButton color="success" size="small" onClick={() => onToggleVisibility(user)}>
                              <RestoreFromTrashIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title={canDelete ? "Eliminar" : "Sin permisos"}>
                            <span>
                              <IconButton color="error" size="small" onClick={() => onToggleVisibility(user)} disabled={!canDelete}>
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
                    <Typography variant="body2" color="text.secondary">No se encontraron usuarios</Typography>
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
      )}
    </Box>
  );
}
