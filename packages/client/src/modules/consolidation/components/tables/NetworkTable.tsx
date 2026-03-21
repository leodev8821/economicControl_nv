import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Stack,
  Chip,
  TableSortLabel,
  useMediaQuery,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";

import type { NetworkType } from "@economic-control/shared";

interface Props {
  rows: NetworkType[];
  onEdit: (network: NetworkType) => void;
  onToggleVisibility: (network: NetworkType) => void;
}

// --- Tipos y Funciones auxiliares para el ordenamiento ---
type Order = "asc" | "desc";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]?: any }, b: { [key in Key]?: any }) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function NetworkTable({
  rows,
  onEdit,
  onToggleVisibility,
}: Props) {
  const isMobile = useMediaQuery("(max-width: 599px) and (orientation: portrait), (max-height: 400px) and (orientation: landscape)");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof NetworkType>("id");

  // --- Manejadores de eventos ---
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: keyof NetworkType) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // --- Procesamiento de datos (Memoizado para rendimiento) ---
  const displayedRows = useMemo(() => {
    // 1. Formateamos
    const formattedRows = rows.map((n) => ({
      ...n,
      is_visible: !!n.is_visible,
    }));

    // 2. Ordenamos
    const sortedRows = formattedRows.sort(getComparator(order, orderBy));

    // 3. Paginamos
    return sortedRows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [rows, order, orderBy, page, rowsPerPage]);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {isMobile ? (
        <Box sx={{ p: 1 }}>
          {displayedRows.length > 0 ? (
            displayedRows.map((row) => (
              <Card
                key={row.id}
                sx={{ mb: 1, opacity: row.is_visible ? 1 : 0.5 }}
              >
                <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        #{row.id}
                      </Typography>
                      <Typography variant="h6">{row.name}</Typography>
                    </Box>
                    {row.is_visible ? (
                      <Chip label="Activo" color="success" size="small" />
                    ) : (
                      <Chip label="Inactiva" color="default" size="small" />
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(row)}
                    disabled={!row.is_visible}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color={row.is_visible ? "error" : "success"}
                    onClick={() => onToggleVisibility(row)}
                  >
                    {row.is_visible ? <DeleteIcon /> : <RestoreIcon />}
                  </IconButton>
                </CardActions>
              </Card>
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                No hay redes disponibles
              </Typography>
            </Box>
          )}

          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} de ${count}`
            }
          />
        </Box>
      ) : (
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" aria-label="tabla de redes">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 80, fontWeight: "bold", whiteSpace: "nowrap" }}>
                  <TableSortLabel
                    active={orderBy === "id"}
                    direction={orderBy === "id" ? order : "asc"}
                    onClick={() => handleRequestSort("id")}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={{ minWidth: 200, fontWeight: "bold", whiteSpace: "nowrap" }}>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleRequestSort("name")}
                  >
                    Nombre
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={{ width: 130, fontWeight: "bold", whiteSpace: "nowrap" }}>
                  <TableSortLabel
                    active={orderBy === "is_visible"}
                    direction={orderBy === "is_visible" ? order : "asc"}
                    onClick={() => handleRequestSort("is_visible")}
                  >
                    Estado
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={{ width: 150, fontWeight: "bold", whiteSpace: "nowrap" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {displayedRows.length > 0 ? (
                displayedRows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      opacity: row.is_visible ? 1 : 0.5,
                      "&:last-child td, &:last-child th": { border: 0 },
                      "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                    }}
                  >
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{row.id}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{row.name}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {row.is_visible ? (
                        <Chip label="Activo" color="success" size="small" />
                      ) : (
                        <Chip label="Inactiva" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => onEdit(row)}
                          disabled={!row.is_visible}
                          title={row.is_visible ? "Editar" : "No editable"}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          size="small"
                          color={row.is_visible ? "error" : "success"}
                          onClick={() => onToggleVisibility(row)}
                          title={row.is_visible ? "Eliminar" : "Restaurar"}
                        >
                          {row.is_visible ? <DeleteIcon /> : <RestoreIcon />}
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No hay redes disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!isMobile && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count}`
          }
        />
      )}
    </Paper>
  );
}
