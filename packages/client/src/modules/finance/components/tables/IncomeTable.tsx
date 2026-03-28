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
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Chip,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";

// Iconos
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalculateIcon from "@mui/icons-material/Calculate";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";

import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Tipos
import type { Income } from "@modules/finance/types/income.type";
import { INCOME_SOURCES } from "@modules/finance/types/income.type";

interface IncomeTableProps {
  incomes: Income[];
  highlightedRowId?: number | null;
  onEdit: (income: Income) => void;
  onDelete: (id: number) => void;
}

// Tipos para la ordenación
type Order = "asc" | "desc";
type OrderBy =
  | keyof Income
  | "weekString"
  | "personDni"
  | "personName"
  | "personLastName";

export default function IncomeTable({
  incomes,
  onEdit,
  onDelete,
  highlightedRowId,
}: IncomeTableProps) {
  const isMobile = useMediaQuery(
    "(max-width: 899px) and (orientation: portrait), (max-height: 500px) and (orientation: landscape)",
  );

  // --- Estados ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");

  const initialFilters = {
    global: "",
    source: "all",
    minAmount: "",
    maxAmount: "",
    startDate: null as Dayjs | null,
    endDate: null as Dayjs | null,
    personName: "",
    personLastName: "",
    personDni: "",
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

  const availableWeeks = useMemo(() => {
    const weeksMap = new Map();
    incomes.forEach((income) => {
      if (income.Week) {
        weeksMap.set(income.Week.id, income.Week);
      }
    });
    // Retornamos array ordenado por ID de semana
    return Array.from(weeksMap.values()).sort((a, b) => b.id - a.id);
  }, [incomes]);

  const availableCashes = useMemo(() => {
    const cashesMap = new Map();
    incomes.forEach((income) => {
      // Intentamos obtener de la relación Cash o usamos el ID
      const id = income.cash_id;
      const name = income.Cash?.name || `Caja ${id}`;
      cashesMap.set(id, { id, name });
    });
    return Array.from(cashesMap.values());
  }, [incomes]);

  // --- 1. Filtrado ---
  const filteredIncomes = useMemo(() => {
    return incomes.filter((income) => {
      // 1. Filtro Global (Texto)
      if (filters.global) {
        const lowerSearch = filters.global.toLowerCase();
        const matchSource = income.source?.toLowerCase().includes(lowerSearch);
        const matchDni = income.Person?.dni
          ?.toLowerCase()
          .includes(lowerSearch);
        const matchId = income.id.toString().includes(lowerSearch);
        if (!matchSource && !matchDni && !matchId) return false;
      }

      // 2. Filtro por Fuente
      if (filters.source !== "all" && income.source !== filters.source) {
        return false;
      }

      // 3. Filtro por Rango de Montos
      if (filters.minAmount && income.amount < Number(filters.minAmount))
        return false;
      if (filters.maxAmount && income.amount > Number(filters.maxAmount))
        return false;

      // 4. Filtro por Rango de Fechas
      const incomeDate = dayjs(income.date);
      if (filters.startDate && incomeDate.isBefore(filters.startDate, "day"))
        return false;
      if (filters.endDate && incomeDate.isAfter(filters.endDate, "day"))
        return false;

      // 5. Filtro por Persona
      if (filters.personDni && income.Person?.dni !== filters.personDni)
        return false;

      if (
        filters.personName &&
        income.Person?.first_name !== filters.personName
      )
        return false;

      if (
        filters.personLastName &&
        income.Person?.last_name !== filters.personLastName
      )
        return false;

      // 6. Filtro por Semana
      if (filters.weekId !== "all" && income.week_id !== Number(filters.weekId))
        return false;

      // 7. Filtro por Caja
      if (
        filters.cashId !== "all" &&
        income.cash_id !== Number(filters.cashId)
      ) {
        return false;
      }

      return true;
    });
  }, [incomes, filters]);

  // --- 2. Ordenación (Sorting) ---
  const sortedIncomes = useMemo(() => {
    // Función helper para obtener el valor primitivo a comparar
    const getValue = (item: Income, column: OrderBy) => {
      switch (column) {
        case "cash_id":
          return item.Cash?.name || "";
        case "weekString":
          return item.Week ? new Date(item.Week.week_start).getTime() : 0;
        case "personDni":
          return item.Person?.dni || "";
        case "personName":
          return item.Person?.first_name || "";
        case "personLastName":
          return item.Person?.last_name || "";
        case "date":
          return new Date(item.date).getTime();
        default:
          return item[column as keyof Income];
      }
    };

    return [...filteredIncomes].sort((a, b) => {
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
  }, [filteredIncomes, order, orderBy]);

  // --- Cálculo del Total ---
  const totalAmount = useMemo(() => {
    return filteredIncomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [filteredIncomes]);

  // --- 3. Paginación ---
  const paginatedIncomes = useMemo(() => {
    return sortedIncomes.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [sortedIncomes, page, rowsPerPage]);

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

  // Helper para renderizar cabeceras ordenables
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
    // 1. Definimos las cabeceras
    const headers = [
      "ID",
      "Caja",
      "Semana",
      "Fecha",
      "Monto",
      "Fuente",
      "Nombre",
      "Apellido",
      "NIF",
    ];

    // 2. Mapeamos los datos ORDENADOS Y FILTRADOS (lo que el usuario ve)
    const rows = sortedIncomes.map((income) => [
      income.id,
      income.Cash?.name || "-",
      income.Week ? `S${income.Week.id}` : "-",
      new Date(income.date).toLocaleDateString(),
      income.amount,
      income.source || "",
      income.Person?.first_name || "",
      income.Person?.last_name || "",
      income.Person?.dni || "",
    ]);

    // 3. Unimos todo con puntos y comas (típico para Excel en español) o comas
    const csvContent = [headers, ...rows].map((e) => e.join(";")).join("\n");

    // 4. Creamos el archivo y disparamos la descarga
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `ingresos_filtrados_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
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
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", md: "center" },
            gap: 2,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
              p: { xs: 1.5, sm: 2 },
              bgcolor: "primary.main",
              color: "primary.contrastText",
              borderRadius: 2,
              minWidth: { xs: "100%", sm: "200px", md: "250px" },
              boxShadow: 2,
            }}
          >
            <CalculateIcon fontSize="medium" />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.9,
                  letterSpacing: 1,
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                }}
              >
                TOTAL FILTRADO
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" } }}
              >
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
              flexDirection: { xs: "column", sm: "row" },
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
              size="small"
            >
              Exportar
            </Button>
            <TextField
              placeholder="Buscar..."
              variant="outlined"
              size="small"
              value={searchText}
              onChange={handleSearchChange}
              sx={{ minWidth: { xs: "100%", sm: 200, md: 300 } }}
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
              startIcon={
                showFilters ? <FilterListOffIcon /> : <FilterListIcon />
              }
              onClick={() => setShowFilters(!showFilters)}
              color="primary"
            >
              {showFilters
                ? "Ocultar Filtros Avanzados"
                : "Mostrar Filtros Avanzados"}
            </Button>

            {/* Búsqueda Global Rápida */}
            <TextField
              placeholder="Búsqueda rápida (ID, NIF...)"
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
              sx={{ minWidth: { xs: "100%", sm: 200, md: 300 } }}
            />
          </Stack>

          <Collapse in={showFilters}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={2} alignItems="center" mt={1}>
                <Grid size={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Fuente</InputLabel>
                    <Select
                      value={filters.source}
                      label="Fuente"
                      onChange={(e) =>
                        setFilters({ ...filters, source: e.target.value })
                      }
                    >
                      <MenuItem value="all">
                        <em>Todas</em>
                      </MenuItem>
                      {INCOME_SOURCES.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Filtro Semana */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DatePicker
                    label="Desde"
                    value={filters.startDate}
                    onChange={(val) =>
                      setFilters({ ...filters, startDate: val })
                    }
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DatePicker
                    label="Hasta"
                    value={filters.endDate}
                    onChange={(val) => setFilters({ ...filters, endDate: val })}
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                </Grid>

                {/* Filtro: Rango Montos */}
                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
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
                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
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

                {/* Filtro: Persona */}
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                  <TextField
                    label="Persona"
                    size="small"
                    fullWidth
                    value={filters.personDni}
                    onChange={(e) =>
                      setFilters({ ...filters, personDni: e.target.value })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                  <TextField
                    label="Nombre"
                    size="small"
                    fullWidth
                    value={filters.personName}
                    onChange={(e) =>
                      setFilters({ ...filters, personName: e.target.value })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                  <TextField
                    label="Apellido"
                    size="small"
                    fullWidth
                    value={filters.personLastName}
                    onChange={(e) =>
                      setFilters({ ...filters, personLastName: e.target.value })
                    }
                  />
                </Grid>

                {/* Botón Reset */}
                <Grid size={12} display="flex" justifyContent="flex-end">
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

        {isMobile ? (
          <Box>
            {paginatedIncomes.length > 0 ? (
              paginatedIncomes.map((row) => (
                <Card
                  key={row.id}
                  sx={{
                    mb: 1,
                    borderLeft: highlightedRowId === row.id ? 4 : 0,
                    borderColor: "warning.main",
                  }}
                >
                  <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {row.Person?.first_name || "-"}{" "}
                        {row.Person?.last_name || ""}
                      </Typography>
                      <Chip label={row.source || "-"} size="small" />
                    </Box>

                    <Grid container spacing={1}>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          Monto
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace", fontWeight: 500 }}
                        >
                          {row.amount.toFixed(2)} €
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          Fecha
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(row.date)}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          Caja
                        </Typography>
                        <Typography variant="body2">
                          {row.Cash?.name || "-"}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary">
                          Semana
                        </Typography>
                        <Typography variant="body2">
                          {row.Week ? `S${row.Week.id}` : "-"}
                        </Typography>
                      </Grid>
                      <Grid size={12}>
                        <Typography variant="caption" color="text.secondary">
                          NIF
                        </Typography>
                        <Typography variant="body2">
                          {row.Person?.dni || "-"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>

                  <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
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
                  </CardActions>
                </Card>
              ))
            ) : (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  No se encontraron resultados
                </Typography>
              </Paper>
            )}

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredIncomes.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página"
            />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={1}
            sx={{ borderRadius: 2, overflowX: "auto" }}
          >
            <Table size="small" aria-label="income table">
              <TableHead sx={{ bgcolor: "primary.main" }}>
                <TableRow>
                  <SortableHeader id="id" label="ID" />
                  <SortableHeader id="cash_id" label="Caja" />
                  <SortableHeader id="weekString" label="Semana" />
                  <SortableHeader id="date" label="Fecha" />
                  <SortableHeader id="amount" label="Monto" align="right" />
                  <SortableHeader id="source" label="Fuente" />
                  <SortableHeader id="personName" label="Nombre" />
                  <SortableHeader id="personLastName" label="Apellido" />
                  <SortableHeader id="personDni" label="NIF" />

                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedIncomes.length > 0 ? (
                  paginatedIncomes.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        backgroundColor:
                          highlightedRowId === row.id
                            ? "warning.light"
                            : "inherit",
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.id}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title={`ID de Caja: ${row.cash_id}`}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {row.Cash?.name || `Caja ${row.cash_id}`}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.Week
                          ? `S${row.Week.id} (${formatDate(row.Week.week_start)} - ${formatDate(row.Week.week_end)})`
                          : "-"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDate(row.date)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.amount.toFixed(2)} €
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.source || "-"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.Person?.first_name || "-"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.Person?.last_name || "-"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.Person?.dni || "-"}
                      </TableCell>
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
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
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
              count={filteredIncomes.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página"
            />
          </TableContainer>
        )}
      </Box>
    </LocalizationProvider>
  );
}
