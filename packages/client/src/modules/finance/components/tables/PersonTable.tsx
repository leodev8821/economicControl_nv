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
  Typography,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Grid,
  TableSortLabel,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Person } from "@modules/finance/types/person.type";

type Order = "asc" | "desc";

interface PersonTableProps {
  persons: Person[];
  onEdit: (person: Person) => void;
  onDelete: (id: number) => void;
}

export default function PersonTable({
  persons,
  onEdit,
  onDelete,
}: PersonTableProps) {
  // Detección de dispositivos móviles (mismo breakpoint que ConsolidationTable)
  const isMobile = useMediaQuery(
    "(max-width: 899px) and (orientation: portrait), (max-height: 500px) and (orientation: landscape)"
  );

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados de ordenamiento
  const [orderBy, setOrderBy] = useState<keyof Person>("id");
  const [order, setOrder] = useState<Order>("asc");

  // Lógica de ordenamiento
  const sortedData = useMemo(() => {
    return [...persons].sort((a, b) => {
      const valA = a[orderBy] ?? "";
      const valB = b[orderBy] ?? "";

      if (valB < valA) return order === "asc" ? 1 : -1;
      if (valB > valA) return order === "asc" ? -1 : 1;
      return 0;
    });
  }, [persons, order, orderBy]);

  // Lógica de paginación
  const paginatedData = useMemo(() => {
    return sortedData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedData, page, rowsPerPage]);

  // Handler para el ordenamiento
  const handleSort = (field: keyof Person) => {
    const isAsc = orderBy === field && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(field);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 0 }, width: "100%" }}>
      {isMobile ? (
        // =======================
        // VISTA MÓVIL (CARDS)
        // =======================
        <Box>
          {paginatedData.map((row) => (
            <Card key={row.id} sx={{ mb: 1 }}>
              <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {row.first_name || "-"} {row.last_name || "-"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {row.id}
                  </Typography>
                </Box>

                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography variant="caption" color="text.secondary">
                      NIF / DNI
                    </Typography>
                    <Typography variant="body2">{row.dni || "-"}</Typography>
                  </Grid>
                </Grid>
              </CardContent>

              <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => onEdit(row)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => onDelete(row.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}

          {persons.length === 0 && (
            <Typography sx={{ textAlign: "center", mt: 2, color: "text.secondary" }}>
              No hay personas para mostrar.
            </Typography>
          )}

          <TablePagination
            component="div"
            count={persons.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Filas por página"
          />
        </Box>
      ) : (
        // =======================
        // VISTA ESCRITORIO (TABLA)
        // =======================
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "primary.main" }}>
              <TableRow>
                {/* Columna ID */}
                <TableCell sx={{ color: "white", whiteSpace: "nowrap" }}>
                  <TableSortLabel
                    active={orderBy === "id"}
                    direction={orderBy === "id" ? order : "asc"}
                    onClick={() => handleSort("id")}
                    sx={{
                      color: "inherit",
                      "&.Mui-active": { color: "white" },
                      "& .MuiTableSortLabel-icon": {
                        color: "white !important",
                      },
                    }}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>

                {/* Columna Nombre */}
                <TableCell sx={{ color: "white", whiteSpace: "nowrap" }}>
                  <TableSortLabel
                    active={orderBy === "first_name"}
                    direction={orderBy === "first_name" ? order : "asc"}
                    onClick={() => handleSort("first_name")}
                    sx={{
                      color: "inherit",
                      "&.Mui-active": { color: "white" },
                      "& .MuiTableSortLabel-icon": {
                        color: "white !important",
                      },
                    }}
                  >
                    Nombre
                  </TableSortLabel>
                </TableCell>

                {/* Columna Apellidos */}
                <TableCell sx={{ color: "white", whiteSpace: "nowrap" }}>
                  <TableSortLabel
                    active={orderBy === "last_name"}
                    direction={orderBy === "last_name" ? order : "asc"}
                    onClick={() => handleSort("last_name")}
                    sx={{
                      color: "inherit",
                      "&.Mui-active": { color: "white" },
                      "& .MuiTableSortLabel-icon": {
                        color: "white !important",
                      },
                    }}
                  >
                    Apellidos
                  </TableSortLabel>
                </TableCell>

                {/* Columna NIF */}
                <TableCell sx={{ color: "white", whiteSpace: "nowrap" }}>
                  <TableSortLabel
                    active={orderBy === "dni"}
                    direction={orderBy === "dni" ? order : "asc"}
                    onClick={() => handleSort("dni")}
                    sx={{
                      color: "inherit",
                      "&.Mui-active": { color: "white" },
                      "& .MuiTableSortLabel-icon": {
                        color: "white !important",
                      },
                    }}
                  >
                    NIF
                  </TableSortLabel>
                </TableCell>

                {/* Columna Acciones */}
                <TableCell sx={{ color: "yellow", fontWeight: "bold", whiteSpace: "nowrap" }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{row.id}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{row.first_name || "-"}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{row.last_name || "-"}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{row.dni || "-"}</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => onEdit(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => onDelete(row.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    No hay personas registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={persons.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Filas por página"
          />
        </TableContainer>
      )}
    </Box>
  );
}