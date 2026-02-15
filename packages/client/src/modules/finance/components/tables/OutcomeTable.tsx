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
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import type { Outcome } from "@modules/finance/types/outcome.type";
import type { GridRowId } from "@mui/x-data-grid";

interface OutcomeTableProps {
  outcomes: Outcome[];
  onEdit: (outcome: Outcome) => void;
  onDelete: (id: GridRowId) => void;
}

type Order = "asc" | "desc";
type OrderBy = keyof Outcome | "cashName" | "weekString";

export default function OutcomeTable({
  outcomes,
  onEdit,
  onDelete,
}: OutcomeTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<OrderBy>("date");

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
    new Date(date).toLocaleDateString();

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
    <TableCell align={align} sx={{ fontWeight: "bold" }}>
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

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredData = useMemo(() => {
    if (!searchText) return outcomes;
    const s = searchText.toLowerCase();
    return outcomes.filter(
      (o) =>
        o.description?.toLowerCase().includes(s) ||
        o.category?.toLowerCase().includes(s) ||
        o.Cash?.name.toLowerCase().includes(s),
    );
  }, [outcomes, searchText]);

  const exportToCSV = () => {
    // 1. Definimos las cabeceras
    const headers = [
      "ID",
      "Semana",
      "Fecha",
      "Monto",
      "Categoría",
      "Descripción",
    ];

    // 2. Mapeamos los datos ORDENADOS Y FILTRADOS (lo que el usuario ve)
    const rows = sortedData.map((outcome) => [
      outcome.id,
      `S${outcome.Week?.id} (${formatDate(outcome.Week?.week_start)} - ${formatDate(outcome.Week?.week_end)})` ||
        "-",
      new Date(outcome.date).toLocaleDateString(),
      outcome.amount,
      outcome.category || "",
      outcome.description || "",
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
      `gastos_filtrados_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedData = useMemo(() => {
    const getValue = (item: Outcome, col: OrderBy) => {
      if (col === "id") return item.id;
      if (col === "weekString")
        return item.Week ? new Date(item.Week.week_start).getTime() : 0;
      if (col === "date") return new Date(item.date).getTime();
      if (col === "amount") return item.amount;
      if (col === "category") return item.category;
      if (col === "description") return item.description;
      return item[col as keyof Outcome] ?? "";
    };
    return [...filteredData].sort((a, b) => {
      const vA = getValue(a, orderBy);
      const vB = getValue(b, orderBy);
      return order === "asc" ? (vA < vB ? -1 : 1) : vB < vA ? -1 : 1;
    });
  }, [filteredData, order, orderBy]);

  const total = useMemo(
    () => filteredData.reduce((acc, curr) => acc + (curr.amount || 0), 0),
    [filteredData],
  );

  const paginated = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "error.main",
          color: "white",
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
            <Typography variant="caption">TOTAL GASTOS FILTRADOS</Typography>
            <Typography variant="h4" fontWeight="bold">
              {total.toFixed(2)} €
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "error.dark" }}>
            <TableRow>
              <SortableHeader id="id" label="ID" />
              <SortableHeader id="weekString" label="Semana" />
              <SortableHeader id="date" label="Fecha" />
              <SortableHeader id="amount" label="Monto" align="right" />
              <SortableHeader id="category" label="Categoría" />
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Descripción
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
            {paginated.length > 0 ? (
              paginated.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  hover
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
          count={filteredData.length}
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
