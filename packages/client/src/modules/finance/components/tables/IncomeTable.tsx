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
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";

// Iconos
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalculateIcon from "@mui/icons-material/Calculate";
import DownloadIcon from "@mui/icons-material/Download";

// Tipos
import type { Income } from "@modules/finance/types/income.type";

interface IncomeTableProps {
  incomes: Income[];
  highlightedRowId?: number | null;
  onEdit: (income: Income) => void;
  onDelete: (id: number) => void;
}

// Tipos para la ordenación
type Order = "asc" | "desc";
type OrderBy = keyof Income | "weekString" | "personDni";

export default function IncomeTable({
  incomes,
  onEdit,
  onDelete,
  highlightedRowId,
}: IncomeTableProps) {
  // --- Estados ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");

  // Estados para Sorting
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<OrderBy>("date");

  // --- Handlers de Ordenación ---
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // --- 1. Filtrado ---
  const filteredIncomes = useMemo(() => {
    if (!searchText) return incomes;
    const lowerSearch = searchText.toLowerCase();

    return incomes.filter((income) => {
      const matchSource = income.source?.toLowerCase().includes(lowerSearch);
      const matchDni = income.Person?.dni?.toLowerCase().includes(lowerSearch);
      const matchAmount = income.amount.toString().includes(lowerSearch);
      const matchId = income.id.toString().includes(lowerSearch);
      const dateStr = new Date(income.date).toLocaleDateString();
      const matchDate = dateStr.includes(lowerSearch);

      return matchSource || matchDni || matchAmount || matchId || matchDate;
    });
  }, [incomes, searchText]);

  // --- 2. Ordenación (Sorting) ---
  const sortedIncomes = useMemo(() => {
    // Función helper para obtener el valor primitivo a comparar
    const getValue = (item: Income, column: OrderBy) => {
      switch (column) {
        case "weekString":
          return item.Week ? new Date(item.Week.week_start).getTime() : 0;
        case "personDni":
          return item.Person?.dni || "";
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
    const headers = ["ID", "Semana", "Fecha", "Monto", "Fuente", "NIF Persona"];

    // 2. Mapeamos los datos ORDENADOS Y FILTRADOS (lo que el usuario ve)
    const rows = sortedIncomes.map((income) => [
      income.id,
      income.Week ? `S${income.Week.id}` : "-",
      new Date(income.date).toLocaleDateString(),
      income.amount,
      income.source || "",
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
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderRadius: 2,
            minWidth: "250px",
            boxShadow: 2,
          }}
        >
          <CalculateIcon fontSize="large" />
          <Box>
            <Typography
              variant="caption"
              sx={{ opacity: 0.9, letterSpacing: 1 }}
            >
              TOTAL FILTRADO
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

      {/* Tabla */}
      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="income table">
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              {/* Cabeceras Ordenables */}
              <SortableHeader id="id" label="ID" />
              <SortableHeader id="weekString" label="Semana" />
              <SortableHeader id="date" label="Fecha" />
              <SortableHeader id="amount" label="Monto" align="right" />
              <SortableHeader id="source" label="Fuente" />
              <SortableHeader id="personDni" label="NIF Persona" />

              {/* Columna de Acciones (No ordenable) */}
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
                      highlightedRowId === row.id ? "warning.light" : "inherit",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <TableCell>{row.id}</TableCell>
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
                  <TableCell>{row.source || "-"}</TableCell>
                  <TableCell>{row.Person?.dni || "-"}</TableCell>
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
          count={filteredIncomes.length}
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
