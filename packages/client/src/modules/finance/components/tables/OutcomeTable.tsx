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

// Iconos
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import TrendingDownIcon from "@mui/icons-material/TrendingDown"; // Icono para gastos

import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Tipos
import type { Outcome } from "@modules/finance/types/outcome.type";
import { OUTCOME_CATEGORY } from "@modules/finance/types/outcome.type";

interface OutcomeTableProps {
  outcomes: Outcome[];
  highlightedRowId?: number | null; // Añadido para consistencia con IncomeTable
  onEdit: (outcome: Outcome) => void;
  onDelete: (id: number) => void;
}

// Tipos para la ordenación
type Order = "asc" | "desc";
type OrderBy = keyof Outcome | "weekString" | "cashName";

export default function OutcomeTable({
  outcomes,
  onEdit,
  onDelete,
  highlightedRowId,
}: OutcomeTableProps) {
  // --- Estados ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");

  const initialFilters = {
    global: "",
    category: "all",
    minAmount: "",
    maxAmount: "",
    startDate: null as Dayjs | null,
    endDate: null as Dayjs | null,
    weekId: "all",
    cashId: "all",
  };

  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  // Estados para Sorting
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<OrderBy>("date");

  // --- Handlers de Ordenación ---
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Helper para limpiar filtros
  const handleResetFilters = () => {
    setFilters(initialFilters);
    setPage(0);
  };

  // 1. Extraer Semanas Disponibles (Memoizado)
  const availableWeeks = useMemo(() => {
    const weeksMap = new Map();
    outcomes.forEach((outcome) => {
      if (outcome.Week) {
        weeksMap.set(outcome.Week.id, outcome.Week);
      }
    });
    return Array.from(weeksMap.values()).sort((a, b) => b.id - a.id);
  }, [outcomes]);

  const availableCashes = useMemo(() => {
    const cashesMap = new Map();
    outcomes.forEach((outcome) => {
      // Intentamos obtener de la relación Cash o usamos el ID
      const id = outcome.cash_id;
      const name = outcome.Cash?.name || `Caja ${id}`;
      cashesMap.set(id, { id, name });
    });
    return Array.from(cashesMap.values());
  }, [outcomes]);

  // --- 3. Filtrado ---
  const filteredOutcomes = useMemo(() => {
    return outcomes.filter((outcome) => {
      // A. Filtro Global (Texto)
      if (filters.global) {
        const lowerSearch = filters.global.toLowerCase();
        const matchDesc = outcome.description
          ?.toLowerCase()
          .includes(lowerSearch);
        const matchCat = outcome.category?.toLowerCase().includes(lowerSearch);
        const matchId = outcome.id.toString().includes(lowerSearch);

        if (!matchDesc && !matchCat && !matchId) return false;
      }

      // B. Filtro por Categoría
      if (filters.category !== "all" && outcome.category !== filters.category) {
        return false;
      }

      // C. Filtro por Rango de Montos
      if (filters.minAmount && outcome.amount < Number(filters.minAmount))
        return false;
      if (filters.maxAmount && outcome.amount > Number(filters.maxAmount))
        return false;

      // D. Filtro por Rango de Fechas
      const outcomeDate = dayjs(outcome.date);
      if (filters.startDate && outcomeDate.isBefore(filters.startDate, "day"))
        return false;
      if (filters.endDate && outcomeDate.isAfter(filters.endDate, "day"))
        return false;

      // E. Filtro por Semana
      if (
        filters.weekId !== "all" &&
        outcome.Week?.id !== Number(filters.weekId)
      )
        return false;

      // F. Filtro por Caja
      if (
        filters.cashId !== "all" &&
        outcome.cash_id !== Number(filters.cashId)
      ) {
        return false;
      }

      return true;
    });
  }, [outcomes, filters]);

  // --- 4. Ordenación (Sorting) ---
  const sortedOutcomes = useMemo(() => {
    const getValue = (item: Outcome, column: OrderBy) => {
      switch (column) {
        case "cash_id":
          return item.Cash?.name || "";
        case "weekString":
          return item.Week ? new Date(item.Week.week_start).getTime() : 0;
        case "cashName":
          return item.Cash?.name || "";
        case "date":
          return new Date(item.date).getTime();
        default:
          return item[column as keyof Outcome];
      }
    };

    return [...filteredOutcomes].sort((a, b) => {
      const valueA = getValue(a, orderBy);
      const valueB = getValue(b, orderBy);

      if (!valueA || !valueB) return 0;

      if (valueB < valueA) {
        return order === "desc" ? -1 : 1;
      }
      if (valueB > valueA) {
        return order === "desc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredOutcomes, order, orderBy]);

  // --- Cálculo del Total ---
  const totalAmount = useMemo(() => {
    return filteredOutcomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [filteredOutcomes]);

  // --- 5. Paginación ---
  const paginatedOutcomes = useMemo(() => {
    return sortedOutcomes.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [sortedOutcomes, page, rowsPerPage]);

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

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // Helper para cabeceras
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
      "ID",
      "Caja",
      "Semana",
      "Fecha",
      "Monto",
      "Categoría",
      "Descripción",
    ];

    const rows = sortedOutcomes.map((outcome) => [
      outcome.id,
      outcome.Cash?.name || "-",
      outcome.Week ? `S${outcome.Week.id}` : "-",
      new Date(outcome.date).toLocaleDateString(),
      outcome.amount,
      outcome.category || "",
      outcome.description || "",
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `gastos_filtrados_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box
      sx={{
        p: 4,
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
            bgcolor: "error.main",
            color: "error.contrastText",
            borderRadius: 2,
            minWidth: "250px",
            boxShadow: 2,
          }}
        >
          <TrendingDownIcon fontSize="large" />
          <Box>
            <Typography
              variant="caption"
              sx={{ opacity: 0.9, letterSpacing: 1 }}
            >
              TOTAL GASTOS FILTRADOS
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {totalAmount.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
              })}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
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
            sx={{ minWidth: 300 }}
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

          {/* Búsqueda Global Rápida vinculada al filtro global */}
          <TextField
            placeholder="Búsqueda rápida (Desc, Cat...)"
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
            sx={{ width: 300 }}
          />
        </Stack>

        <Collapse in={showFilters}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} alignItems="center">
              {/* Filtro: Categoría (Equivalente a Fuente en Income) */}
              <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={filters.category}
                    label="Categoría"
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                  >
                    <MenuItem value="all">
                      <em>Todas</em>
                    </MenuItem>
                    {OUTCOME_CATEGORY.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Filtro Caja */}
              <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Caja</InputLabel>
                  <Select
                    value={filters.cashId}
                    label="Caja"
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        cashId: e.target.value,
                      }));
                      setPage(0);
                    }}
                  >
                    <MenuItem value="all">
                      <em>Todas las cajas</em>
                    </MenuItem>
                    {availableCashes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        📦 {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Filtro Semana */}
              <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Semana</InputLabel>
                  <Select
                    value={filters.weekId}
                    label="Semana"
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        weekId: e.target.value,
                      }));
                      setPage(0);
                    }}
                  >
                    <MenuItem value="all">
                      <em>Todas las semanas</em>
                    </MenuItem>
                    {availableWeeks.map((w) => (
                      <MenuItem key={w.id} value={w.id}>
                        S{w.id} ({dayjs(w.week_start).format("DD/MM")} -{" "}
                        {dayjs(w.week_end).format("DD/MM")})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Filtro: Rango Fechas */}
              <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label="Desde"
                  value={filters.startDate}
                  onChange={(val) => setFilters({ ...filters, startDate: val })}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label="Hasta"
                  value={filters.endDate}
                  onChange={(val) => setFilters({ ...filters, endDate: val })}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </Grid>

              {/* Filtro: Rango Montos */}
              <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Min €"
                  type="number"
                  size="small"
                  fullWidth
                  value={filters.minAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, minAmount: e.target.value })
                  }
                />
              </Grid>
              <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Max €"
                  type="number"
                  size="small"
                  fullWidth
                  value={filters.maxAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, maxAmount: e.target.value })
                  }
                />
              </Grid>

              {/* Botón Reset */}
              <Grid
                sx={{ xs: 12, sm: 6, md: 3 }}
                display="flex"
                justifyContent="flex-end"
              >
                <Button
                  color="inherit"
                  onClick={handleResetFilters}
                  size="small"
                >
                  Limpiar Filtros
                </Button>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Collapse>
      </Paper>

      {/* Tabla */}
      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="outcome table">
          <TableHead sx={{ bgcolor: "info.main" }}>
            <TableRow>
              <SortableHeader id="id" label="ID" />
              <SortableHeader id="cash_id" label="Caja" />
              <SortableHeader id="weekString" label="Semana" />
              <SortableHeader id="date" label="Fecha" />
              <SortableHeader id="amount" label="Monto" align="right" />
              <SortableHeader id="category" label="Categoría" />
              <SortableHeader id="description" label="Descripción" />

              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOutcomes.length > 0 ? (
              paginatedOutcomes.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    backgroundColor:
                      highlightedRowId === row.id ? "warning.light" : "inherit",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Tooltip title={`ID de Caja: ${row.cash_id}`}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.Cash?.name || `Caja ${row.cash_id}`}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {row.Week
                      ? `S${row.Week.id} (${formatDate(row.Week.week_start)} - ${formatDate(row.Week.week_end)})`
                      : "-"}
                  </TableCell>
                  <TableCell>{formatDate(row.date)}</TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontFamily: "monospace", fontWeight: 500 }}
                  >
                    {row.amount.toFixed(2)} €
                  </TableCell>
                  <TableCell>{row.category || "-"}</TableCell>
                  <TableCell>{row.description || "-"}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        color="primary"
                        onClick={() => onEdit(row)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        color="error"
                        onClick={() => onDelete(row.id)}
                        size="small"
                        disabled={highlightedRowId === row.id}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron resultados
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOutcomes.length}
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
