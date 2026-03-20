import { useState, useMemo } from "react";
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
  IconButton,
  TextField,
  Select,
  MenuItem,
  Typography,
  TableSortLabel,
  Snackbar,
  CircularProgress,
  Collapse,
  Grid,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es";

import {
  useConsolidations,
  useUpdateConsolidation,
} from "@modules/consolidation/hooks/useConsolidationApi";

import { z } from "zod";

import { HOW_KNOW_US, CALL_OBSERVATIONS } from "@economic-control/shared";

import {
  type ConsolidationPopulatedType,
  ConsolidationUpdateSchema,
} from "@economic-control/shared";
import { useNetworks } from "@modules/consolidation/hooks/useNetwork";
import { useAuth } from "@/modules/auth/hooks/useAuth";

type Order = "asc" | "desc";

const validateWithZod = (payload: any) => {
  const result = ConsolidationUpdateSchema.safeParse(payload);

  if (!result.success) {
    const fieldErrors = z.flattenError(result.error).fieldErrors;
    console.log(fieldErrors);
    return { error: fieldErrors };
  }

  return { data: result.data };
};

const useDateField = (initialValue: any) => {
  const [value, setValue] = useState<Dayjs | null>(
    initialValue ? dayjs(initialValue) : null,
  );

  const reset = (newValue: any) => {
    setValue(newValue ? dayjs(newValue) : null);
  };

  return { value, setValue, reset };
};

const getNeedsAttention = (row: ConsolidationPopulatedType) => {
  if (row.call_date || !row.Member?.visit_date) return false;
  return dayjs().diff(dayjs(row.Member.visit_date), "day") > 2;
};

export default function ConsolidationTable() {
  const { data = [], isLoading } = useConsolidations();
  const { mutate: updateConsolidation } = useUpdateConsolidation();

  const { data: networks = [], isLoading: isLoadingNetworks } = useNetworks();

  const { user: authUser } = useAuth();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { isAdmin, currentUserId } = useMemo(
    () => ({
      isAdmin:
        authUser?.role_name === "SuperUser" ||
        authUser?.role_name === "Administrador",
      currentUserId: authUser?.id,
    }),
    [authUser],
  );

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: "all",
    status: "all",
    leader: "all",
    network: "all",
    visitDate: null as Dayjs | null,
  });

  const [search, _setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<string>("id");
  const [order, setOrder] = useState<Order>("asc");

  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<
    Partial<ConsolidationPopulatedType>
  >({});

  const callDateField = useDateField(null);
  const visitDateField = useDateField(null);

  // Estados para el Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error" as "success" | "error",
  });

  const showMsg = (msg: string, sev: "success" | "error" = "error") => {
    setSnackbar({ open: true, message: msg, severity: sev });
  };

  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // --- 1. Obtener lista de líderes únicos para el filtro ---
  const availableLeaders = useMemo(() => {
    const leadersMap = new Map();
    data.forEach((row) => {
      if (row.User) {
        leadersMap.set(row.User.id, row.User.username);
      }
    });
    return Array.from(leadersMap.entries()).map(([id, username]) => ({
      id,
      username,
    }));
  }, [data]);

  // --- 2. Filtrado Avanzado ---
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (!isAdmin && row.user_id !== currentUserId) return false;

      // Filtro Global (Buscador superior)
      if (search) {
        const term = search.toLowerCase();
        return (
          `${row.Member?.first_name} ${row.Member?.last_name}`
            .toLowerCase()
            .includes(term) ||
          row.User?.username?.toLowerCase().includes(term) ||
          row.Network?.name?.toLowerCase().includes(term)
        );
      }

      // Filtros del Panel Avanzado
      if (filters.gender !== "all" && row.Member?.gender !== filters.gender)
        return false;
      if (filters.status !== "all" && row.Member?.status !== filters.status)
        return false;
      if (filters.network !== "all" && row.Network?.name !== filters.network)
        return false;
      if (filters.leader !== "all" && row.User?.username !== filters.leader)
        return false;

      if (filters.visitDate) {
        const fDate = filters.visitDate.format("YYYY-MM-DD");
        const rDate = dayjs(row.Member?.visit_date).format("YYYY-MM-DD");
        if (fDate !== rDate) return false;
      }

      return true;
    });
  }, [data, search, filters, isAdmin, currentUserId]);

  // --- 3. Ordenación ---
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const getValue = (item: ConsolidationPopulatedType, col: string) => {
        if (col === "age") return calculateAge(item.Member?.birth_date) ?? 0;
        if (col === "leader") return item.User?.username || "";
        if (col === "network") return item.Network?.name || "";
        return (item as any)[col] ?? "";
      };

      const valA = getValue(a, orderBy);
      const valB = getValue(b, orderBy);

      if (valB < valA) return order === "asc" ? 1 : -1;
      if (valB > valA) return order === "asc" ? -1 : 1;
      return 0;
    });
  }, [filteredData, order, orderBy]);

  // --- 4. Paginación ---
  const paginatedData = useMemo(() => {
    return sortedData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [sortedData, page, rowsPerPage]);

  /**
   * Calcula la edad a partir de un string de fecha.
   * Soporta formatos YYYY-MM-DD (Base de datos) y DD-MM-YYYY (Formulario/Borrador)
   */
  const calculateAge = (birthDateStr: any): number | null => {
    if (!birthDateStr) return null;
    let birthDate = dayjs(birthDateStr);
    if (!birthDate.isValid()) birthDate = dayjs(birthDateStr, "DD-MM-YYYY");
    return birthDate.isValid() ? dayjs().diff(birthDate, "year") : null;
  };

  const formatDate = (date: any) =>
    date ? dayjs(date).format("DD-MM-YYYY") : "-";

  // HANDLERS
  const handleEdit = (row: ConsolidationPopulatedType) => {
    if (!row.is_visible) {
      showMsg("No se puede editar una consolidación inactiva.", "error");
      return;
    }
    setEditingRowId(row.id);
    setEditedRow({ ...row, network_id: row.network_id ?? null });
    callDateField.reset(row.call_date);
    visitDateField.reset(row.visit_date);
  };

  const handleCancel = () => {
    setEditingRowId(null);
    setEditedRow({});
    callDateField.reset(null);
    visitDateField.reset(null);
  };

  const handleChange = (
    field: keyof ConsolidationPopulatedType,
    value: any,
  ) => {
    setEditedRow((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (id: number) => {
    const payload = {
      how_know_us: editedRow.how_know_us || null,
      invited_by:
        editedRow.how_know_us === HOW_KNOW_US[3]
          ? editedRow.invited_by || null
          : null,
      call_observations: editedRow.call_observations || null,
      other_observations:
        editedRow.call_observations === CALL_OBSERVATIONS[5]
          ? editedRow.other_observations || null
          : null,
      visit_observations: editedRow.visit_observations?.trim() || null,

      call_date: callDateField.value?.isValid()
        ? callDateField.value.toDate()
        : null,

      visit_date: visitDateField.value?.isValid()
        ? visitDateField.value.toDate()
        : null,

      network_id: editedRow.network_id || null,
    };

    const { error, data: validatedData } = validateWithZod(payload);

    if (error) {
      const errorMessages = Object.entries(error)
        .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
        .join(" | ");

      showMsg(`Error en campos: ${errorMessages}`, "error");
      return;
    }

    updateConsolidation(
      { id, data: validatedData },
      {
        onSuccess: () => {
          setEditingRowId(null);
          setEditedRow({});
          showMsg("Cambios guardados correctamente", "success");
        },
        onError: () => {
          showMsg("Error al guardar los cambios", "error");
        },
      },
    );
  };

  const handleSort = (field: string) => {
    const isAsc = orderBy === field && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(field);
  };

  // --- HANDLER PARA INACTIVAR/RESTAURAR ---
  const handleToggleVisibility = (row: ConsolidationPopulatedType) => {
    const newVisibility = !row.is_visible;
    const actionText = newVisibility ? "restaurada" : "inactivada";
    updateConsolidation(
      { id: row.id, data: { is_visible: newVisibility } },
      {
        onSuccess: () => {
          showMsg(`Consolidación ${actionText} correctamente.`, "success");
        },
        onError: () => {
          showMsg(`Error al intentar ${actionText} la consolidación.`, "error");
        },
      },
    );
  };

  if (isLoading) return <Typography>Cargando consolidaciones...</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box sx={{ p: 3 }}>
        {/* FILTROS AVANZADOS */}
        <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="outlined"
            startIcon={showFilters ? <FilterListOffIcon /> : <FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Ocultar Filtros" : "Filtros Avanzados"}
          </Button>

          {/* Chip para limpiar filtros si hay alguno activo */}
          {(filters.gender !== "all" ||
            filters.leader !== "all" ||
            filters.network !== "all") && (
            <Button
              size="small"
              onClick={() =>
                setFilters({
                  gender: "all",
                  status: "all",
                  leader: "all",
                  network: "all",
                  visitDate: null,
                })
              }
            >
              Limpiar Filtros
            </Button>
          )}
        </Box>

        <Collapse in={showFilters}>
          <Paper sx={{ p: 2, mb: 2, bgcolor: "paper" }}>
            <Grid container spacing={2}>
              {/* Filtro Género */}
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  sm: 6,
                  md: 2.4,
                  xs: 12,
                }}
              >
                <FormControl fullWidth size="small">
                  <InputLabel>Género</InputLabel>
                  <Select
                    label="Género"
                    value={filters.gender}
                    onChange={(e) =>
                      setFilters({ ...filters, gender: e.target.value })
                    }
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="Masculino">Masculino</MenuItem>
                    <MenuItem value="Femenino">Femenino</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Filtro Red */}
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  sm: 6,
                  md: 2.4,
                  xs: 12,
                }}
              >
                <FormControl fullWidth size="small">
                  <InputLabel>Red</InputLabel>
                  <Select
                    label="Red"
                    value={filters.network}
                    onChange={(e) =>
                      setFilters({ ...filters, network: e.target.value })
                    }
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    {networks.map((n) => (
                      <MenuItem key={n.id} value={n.name}>
                        {n.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Filtro Líder */}
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  sm: 6,
                  md: 2.4,
                  xs: 12,
                }}
              >
                <FormControl fullWidth size="small">
                  <InputLabel>Líder</InputLabel>
                  <Select
                    label="Líder"
                    value={filters.leader}
                    onChange={(e) =>
                      setFilters({ ...filters, leader: e.target.value })
                    }
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    {availableLeaders.map((l) => (
                      <MenuItem key={l.id} value={l.username}>
                        {l.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Filtro Fecha de Visita */}
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  sm: 6,
                  md: 2.4,
                  xs: 12,
                }}
              >
                <DatePicker
                  label="Fecha de Llegada"
                  value={filters.visitDate}
                  onChange={(val) => setFilters({ ...filters, visitDate: val })}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Collapse>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: "primary.main" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Líder</TableCell>
                <TableCell sx={{ color: "white" }}>Nombre y Apellido</TableCell>
                <TableCell sx={{ color: "white" }}>Teléfono</TableCell>
                <TableCell sx={{ color: "white" }}>Edad</TableCell>
                <TableCell sx={{ color: "white" }}>Estado Civil</TableCell>
                <TableCell sx={{ color: "white" }}>Fecha de llegada</TableCell>
                <TableCell sx={{ color: "white" }}>Red</TableCell>
                <TableCell sx={{ color: "white" }}>Fecha de llamada</TableCell>
                <TableCell sx={{ color: "white" }}>
                  Observaciones llamada
                </TableCell>
                <TableCell sx={{ color: "white" }}>Fecha de visita</TableCell>
                <TableCell sx={{ color: "white" }}>
                  Observaciones visita
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  <TableSortLabel
                    active={orderBy === "how_know_us"}
                    direction={order}
                    onClick={() => handleSort("how_know_us")}
                  >
                    ¿Cómo nos conoció?
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "yellow", fontWeight: "bold" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.map((row) => {
                const isEditing = editingRowId === row.id;
                const isInactive = !row.is_visible;
                const attention = getNeedsAttention(row);

                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      opacity: isInactive ? 0.5 : 1,
                      bgcolor:
                        attention && !isInactive ? "warning.light" : "inherit",
                      "&:hover": {
                        bgcolor:
                          attention && !isInactive
                            ? "warning.main !important"
                            : "",
                      },
                    }}
                  >
                    <TableCell>{row.User?.username}</TableCell>

                    <TableCell>
                      {row.Member
                        ? `${row.Member.first_name} ${row.Member.last_name}`
                        : "-"}
                    </TableCell>

                    <TableCell>{row.Member?.phone}</TableCell>
                    <TableCell>
                      {calculateAge(row.Member?.birth_date) ?? ""}
                    </TableCell>
                    <TableCell>{row.Member?.status}</TableCell>
                    <TableCell>{formatDate(row.Member?.visit_date)}</TableCell>

                    <TableCell>
                      {isEditing ? (
                        isLoadingNetworks ? (
                          <CircularProgress size={24} />
                        ) : (
                          <Select
                            size="small"
                            value={editedRow.network_id ?? ""}
                            onChange={(e) =>
                              handleChange("network_id", e.target.value)
                            }
                          >
                            {networks.map((n) => (
                              <MenuItem key={n.id} value={n.id}>
                                {n.name}
                              </MenuItem>
                            ))}
                          </Select>
                        )
                      ) : (
                        row.Network?.name || "-"
                      )}
                    </TableCell>

                    {/* CALL DATE */}
                    <TableCell>
                      {isEditing ? (
                        <DatePicker
                          value={callDateField.value}
                          onChange={callDateField.setValue}
                          format="DD-MM-YYYY"
                          maxDate={dayjs()}
                          slotProps={{
                            textField: {
                              size: "small",
                            },
                            field: { clearable: true },
                          }}
                        />
                      ) : row.call_date ? (
                        dayjs(row.call_date).format("DD-MM-YYYY")
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    {/* CALL OBS */}
                    <TableCell>
                      {isEditing ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Select
                            size="small"
                            value={editedRow.call_observations ?? ""}
                            onChange={(e) =>
                              handleChange("call_observations", e.target.value)
                            }
                          >
                            {CALL_OBSERVATIONS.map((o) => (
                              <MenuItem key={o} value={o}>
                                {o}
                              </MenuItem>
                            ))}
                          </Select>

                          {editedRow.call_observations ===
                            CALL_OBSERVATIONS[5] && (
                            <TextField
                              size="small"
                              placeholder="Especifique..."
                              value={editedRow.other_observations ?? ""}
                              onChange={(e) =>
                                handleChange(
                                  "other_observations",
                                  e.target.value,
                                )
                              }
                              autoFocus
                            />
                          )}
                        </Box>
                      ) : (
                        <>
                          <Typography variant="body2">
                            {row.call_observations || "-"}
                          </Typography>
                          {row.call_observations === "Otro" &&
                            row.other_observations && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ({row.other_observations})
                              </Typography>
                            )}
                        </>
                      )}
                    </TableCell>

                    {/* VISIT */}
                    <TableCell>
                      {isEditing ? (
                        <DatePicker
                          value={visitDateField.value}
                          onChange={visitDateField.setValue}
                          format="DD-MM-YYYY"
                          slotProps={{
                            textField: {
                              size: "small",
                            },
                            field: { clearable: true },
                          }}
                        />
                      ) : row.visit_date ? (
                        dayjs(row.visit_date).format("DD-MM-YYYY")
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    {/* VISIT OBS */}
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          value={editedRow.visit_observations ?? ""}
                          onChange={(e) =>
                            handleChange("visit_observations", e.target.value)
                          }
                        />
                      ) : (
                        row.visit_observations || "-"
                      )}
                    </TableCell>

                    {/* HOW KNOW */}
                    <TableCell>
                      {isEditing ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Select
                            size="small"
                            value={editedRow.how_know_us ?? ""}
                            onChange={(e) =>
                              handleChange("how_know_us", e.target.value)
                            }
                          >
                            {HOW_KNOW_US.map((o) => (
                              <MenuItem key={o} value={o}>
                                {o}
                              </MenuItem>
                            ))}
                          </Select>

                          {editedRow.how_know_us === HOW_KNOW_US[3] && (
                            <TextField
                              size="small"
                              placeholder="¿Quién invitó?"
                              value={editedRow.invited_by ?? ""}
                              onChange={(e) =>
                                handleChange("invited_by", e.target.value)
                              }
                              autoFocus
                            />
                          )}
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="body2">
                            {row.how_know_us || "-"}
                          </Typography>
                          {row.how_know_us === "Otro" && row.invited_by && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              Inv.: {row.invited_by}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell align="center">
                      {isEditing ? (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => handleSave(row.id)}
                          >
                            <SaveIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={handleCancel}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleEdit(row)}
                            disabled={isInactive}
                            title={
                              isInactive ? "Inactivo (no editable)" : "Editar"
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>

                          {/* BOTÓN DINÁMICO: Inactivar/Restaurar */}
                          {isInactive ? (
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() => handleToggleVisibility(row)}
                              title="Restaurar consolidación"
                            >
                              <RestoreIcon fontSize="small" />
                            </IconButton>
                          ) : (
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleToggleVisibility(row)}
                              title="Inactivar/Eliminar"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) =>
              setRowsPerPage(parseInt(e.target.value, 10))
            }
          />
        </TableContainer>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Paper
          elevation={6}
          sx={{
            bgcolor:
              snackbar.severity === "error" ? "error.main" : "success.main",
            color: "white",
            px: 3,
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography variant="body2">{snackbar.message}</Typography>
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Snackbar>
    </LocalizationProvider>
  );
}
