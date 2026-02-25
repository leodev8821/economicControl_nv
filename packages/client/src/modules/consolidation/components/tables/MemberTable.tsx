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
  InputAdornment,
  TableSortLabel,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Stack,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import dayjs from "dayjs";

// Iconos
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { RestoreFromTrash } from "@mui/icons-material";

// Tipos
import type { Member } from "@modules/consolidation/types/member.type";
import type { User } from "@/modules/auth/types/user.type";

interface MemberTableProps {
  members: Member[];
  highlightedRowId?: number | null;
  currentUser: User;
  onEdit: (member: Member) => void;
  //onDelete: (id: number) => void;
  onToggleVisibility: (member: Member) => void;
}

// Tipos para la ordenación
type Order = "asc" | "desc";
type OrderBy = keyof Member | "age" | "username";

/**
 * Calcula la edad a partir de un string de fecha.
 * Soporta formatos YYYY-MM-DD (Base de datos) y DD-MM-YYYY (Formulario/Borrador)
 */
const calculateAge = (birthDateStr: string | undefined): number | null => {
  if (!birthDateStr) return null;

  // Intentamos parsear la fecha. Dayjs detecta automáticamente el formato ISO (YYYY-MM-DD)
  // Si no es ISO, le indicamos que pruebe con el formato del formulario.
  let birthDate = dayjs(birthDateStr);

  if (!birthDate.isValid()) {
    birthDate = dayjs(birthDateStr, "DD-MM-YYYY");
  }

  if (!birthDate.isValid()) return null;

  const age = dayjs().diff(birthDate, "year");
  return age;
};

export default function MemberTable({
  members,
  currentUser,
  onEdit,
  onToggleVisibility,
  //onDelete,
  highlightedRowId,
}: MemberTableProps) {
  // --- Estados ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");

  const initialFilters = {
    global: "",
    gender: "all",
    status: "all",
    firstName: "",
    lastName: "",
    phone: "",
    visitDate: "",
    leader: "",
  };

  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  // Estados para Sorting
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<OrderBy>("first_name");

  const canManageMember = (member: Member) => {
    // 1. Poder Global: SuperUser o Administrador pueden borrar cualquier cosa
    const isAdmin =
      currentUser.role_name === "SuperUser" ||
      currentUser.role_name === "Administrador";

    // 2. Poder de Propietario: El usuario es quien registró a este miembro
    const isOwner = member.user_id === currentUser.id;

    return isAdmin || isOwner;
  };

  // --- Handlers de Ordenación ---
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setSearchText("");
    setPage(0);
  };

  // --- 1. Filtrado ---
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const isAdmin =
        currentUser.role_name === "SuperUser" ||
        currentUser.role_name === "Administrador";

      // Regla de Visibilidad según Rol
      if (!isAdmin && member.user_id !== currentUser.id) return false;

      // Regla de Borrado Lógico (Soft Delete)
      const isHidden = member.is_visible === false;
      if (isHidden && !isAdmin) return false;

      // 1. Filtro Global (Texto rápido en el input de búsqueda principal)
      if (searchText) {
        const lowerSearch = searchText.toLowerCase();
        const matchName = member.first_name
          ?.toLowerCase()
          .includes(lowerSearch);
        const matchLastName = member.last_name
          ?.toLowerCase()
          .includes(lowerSearch);
        const matchPhone = member.phone?.includes(lowerSearch);
        if (!matchName && !matchLastName && !matchPhone) return false;
      }

      // 2. Filtros Avanzados
      if (filters.global) {
        const lowerGlobal = filters.global.toLowerCase();
        const matchId = member.id.toString().includes(lowerGlobal);
        if (!matchId && !member.first_name?.toLowerCase().includes(lowerGlobal))
          return false;
      }

      if (filters.gender !== "all" && member.gender !== filters.gender)
        return false;
      if (filters.status !== "all" && member.status !== filters.status)
        return false;
      if (
        filters.firstName &&
        !member.first_name
          ?.toLowerCase()
          .includes(filters.firstName.toLowerCase())
      )
        return false;
      if (
        filters.lastName &&
        !member.last_name
          ?.toLowerCase()
          .includes(filters.lastName.toLowerCase())
      )
        return false;
      if (filters.phone && !member.phone?.includes(filters.phone)) return false;
      if (
        filters.leader &&
        !member.User?.username
          ?.toLowerCase()
          .includes(filters.leader.toLowerCase())
      )
        return false;

      return true;
    });
  }, [members, currentUser, filters, searchText]);

  // --- 2. Ordenación (Sorting) ---
  const sortedMembers = useMemo(() => {
    const getValue = (item: Member, column: OrderBy) => {
      if (column === "age") return calculateAge(item.birth_date) ?? -1;
      if (column === "username") return item.User?.username ?? "";
      return item[column as keyof Member] ?? "";
    };

    return [...filteredMembers].sort((a, b) => {
      const valueA = getValue(a, orderBy);
      const valueB = getValue(b, orderBy);

      if (valueB < valueA) return order === "desc" ? -1 : 1;
      if (valueB > valueA) return order === "desc" ? 1 : -1;
      return 0;
    });
  }, [filteredMembers, order, orderBy]);

  // --- 3. Paginación ---
  const paginatedMembers = useMemo(() => {
    return sortedMembers.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [sortedMembers, page, rowsPerPage]);

  // --- Handlers Generales ---
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    setPage(0);
  };

  const SortableHeader = ({
    id,
    label,
    align = "left",
  }: {
    id: OrderBy;
    label: string;
    align?: "left" | "right" | "center";
  }) => (
    <TableCell
      align={align}
      sx={{ fontWeight: "bold", color: "primary.contrastText" }}
    >
      <TableSortLabel
        active={orderBy === id}
        direction={orderBy === id ? order : "asc"}
        onClick={() => handleRequestSort(id)}
      >
        {label}
        {orderBy === id ? (
          <Box component="span" sx={visuallyHidden}>
            {order === "desc" ? "sorted descending" : "sorted ascending"}
          </Box>
        ) : null}
      </TableSortLabel>
    </TableCell>
  );

  const exportToCSV = () => {
    const headers = [
      "Líder",
      "Nombre",
      "Apellido",
      "Teléfono",
      "Género",
      "Fecha Nacimiento",
      "Edad",
      "Estado Civil",
      "Fecha de Visita",
    ];

    const rows = sortedMembers.map((member) => [
      member.User?.username || "",
      member.first_name || "",
      member.last_name || "",
      member.phone || "",
      member.gender || "",
      member.birth_date || "",
      calculateAge(member.birth_date) ?? "",
      member.status || "",
      member.visit_date || "",
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `miembros_filtrados_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box
      sx={{
        p: { xs: 1, md: 4 },
        width: "100%",
        maxWidth: "1200px",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {/* Panel Superior */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderRadius: 2,
            minWidth: "250px",
            boxShadow: 2,
          }}
        >
          <PeopleIcon fontSize="large" />
          <Box>
            <Typography
              variant="caption"
              sx={{ opacity: 0.9, letterSpacing: 1 }}
            >
              TOTAL MIEMBROS (FILTRADO)
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {
                filteredMembers.filter((member) => member.is_visible === true)
                  .length
              }
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            sx={{
              bgcolor: "success.main",
              color: "success.contrastText",
              ":hover": {
                bgcolor: "success.light",
                color: "success.contrastText",
              },
            }}
            variant="outlined"
            onClick={exportToCSV}
            startIcon={<DownloadIcon />}
          >
            Exportar CSV
          </Button>
          <TextField
            placeholder="Buscar..."
            variant="outlined"
            size="small"
            value={searchText}
            onChange={handleSearchChange}
            sx={{ minWidth: { xs: "100%", sm: 300 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Paper>

      {/* PANEL DE FILTROS AVANZADOS */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          flexWrap="wrap"
          gap={2}
        >
          <Button
            startIcon={showFilters ? <FilterListOffIcon /> : <FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            color="primary"
          >
            {showFilters
              ? "Ocultar Filtros Avanzados"
              : "Mostrar Filtros Avanzados"}
          </Button>

          <TextField
            placeholder="Búsqueda rápida (ID...)"
            variant="outlined"
            size="small"
            value={filters.global}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, global: e.target.value }))
            }
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: { xs: "100%", sm: 300 } }}
          />
        </Stack>

        <Collapse in={showFilters}>
          <Grid container spacing={2} alignItems="center" mt={1}>
            <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Género</InputLabel>
                <Select
                  value={filters.gender}
                  label="Género"
                  onChange={(e) =>
                    setFilters({ ...filters, gender: e.target.value })
                  }
                >
                  <MenuItem value="all">
                    <em>Todos</em>
                  </MenuItem>
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Femenino">Femenino</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Líder</InputLabel>
                <Select
                  value={filters.leader}
                  label="Líder"
                  onChange={(e) =>
                    setFilters({ ...filters, leader: e.target.value })
                  }
                >
                  <MenuItem value="all">
                    <em>Todos</em>
                  </MenuItem>
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Femenino">Femenino</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado Civil</InputLabel>
                <Select
                  value={filters.status}
                  label="Estado Civil"
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <MenuItem value="all">
                    <em>Todos</em>
                  </MenuItem>
                  <MenuItem value="Soltero/a">Soltero/a</MenuItem>
                  <MenuItem value="Casado/a">Casado/a</MenuItem>
                  <MenuItem value="Divorciado/a">Divorciado/a</MenuItem>
                  <MenuItem value="Viudo/a">Viudo/a</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Nombre"
                size="small"
                fullWidth
                value={filters.firstName}
                onChange={(e) =>
                  setFilters({ ...filters, firstName: e.target.value })
                }
              />
            </Grid>

            <Grid sx={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                label="Apellido"
                size="small"
                fullWidth
                value={filters.lastName}
                onChange={(e) =>
                  setFilters({ ...filters, lastName: e.target.value })
                }
              />
            </Grid>

            <Grid
              sx={{ xs: 12, sm: 12, md: 2 }}
              display="flex"
              justifyContent="flex-end"
            >
              <Button color="inherit" onClick={handleResetFilters} size="small">
                Limpiar Filtros
              </Button>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {/* Tabla */}
      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="member table">
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <SortableHeader id="username" label="Líder" />
              <SortableHeader id="first_name" label="Nombre" />
              <SortableHeader id="last_name" label="Apellido" />
              <SortableHeader id="phone" label="Teléfono" />
              <SortableHeader id="gender" label="Género" />
              <SortableHeader id="birth_date" label="Nacimiento" />
              <SortableHeader id="age" label="Edad" />
              <SortableHeader id="status" label="Estado Civil" />
              <SortableHeader id="visit_date" label="Fecha de Visita" />

              <TableCell
                sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                align="center"
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMembers.length > 0 ? (
              paginatedMembers.map((row) => {
                const isHidden = row.is_visible === false;
                const isAdmin =
                  currentUser.role_name === "SuperUser" ||
                  currentUser.role_name === "Administrador";
                const canDelete = canManageMember(row);
                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      backgroundColor:
                        highlightedRowId === row.id
                          ? "warning.light"
                          : "inherit",
                      opacity: isHidden ? 0.6 : 1,
                      bgcolor: isHidden
                        ? "action.hover"
                        : highlightedRowId === row.id
                          ? "warning.light"
                          : "inherit",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <TableCell>{row.User?.username || "-"}</TableCell>
                    <TableCell>{row.first_name || "-"}</TableCell>
                    <TableCell>{row.last_name || "-"}</TableCell>
                    <TableCell>{row.phone || "-"}</TableCell>
                    <TableCell>{row.gender || "-"}</TableCell>
                    <TableCell>
                      {dayjs(row.birth_date).isValid()
                        ? dayjs(row.birth_date).format("DD-MM-YYYY")
                        : "-"}
                    </TableCell>

                    <TableCell sx={{ fontWeight: "bold" }}>
                      {calculateAge(row.birth_date) ?? "-"}
                    </TableCell>
                    <TableCell>{row.status || "-"}</TableCell>
                    <TableCell>
                      {dayjs(row.visit_date).isValid()
                        ? dayjs(row.visit_date).format("DD-MM-YYYY")
                        : "-"}
                    </TableCell>

                    {/* ACCIONES */}
                    <TableCell align="center">
                      <Tooltip
                        title={
                          canDelete ? "Editar" : "No tienes permiso para editar"
                        }
                      >
                        <span>
                          <IconButton
                            color="primary"
                            onClick={() => onEdit(row)}
                            disabled={!canDelete}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </span>
                      </Tooltip>

                      {isAdmin && isHidden ? (
                        <Tooltip title="Restaurar Miembro">
                          <IconButton
                            color="success"
                            onClick={() => onToggleVisibility(row)}
                            size="small"
                          >
                            <RestoreFromTrash />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip
                          title={
                            canDelete
                              ? isHidden
                                ? "Ya eliminado"
                                : "Eliminar"
                              : "Solo el propietario o un administrador pueden eliminar"
                          }
                        >
                          <span>
                            <IconButton
                              color="error"
                              onClick={() => onToggleVisibility(row)}
                              size="small"
                              disabled={
                                !canDelete || highlightedRowId === row.id
                              }
                            >
                              <DeleteIcon />
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
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron miembros
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredMembers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
        />
      </TableContainer>
    </Box>
  );
}
