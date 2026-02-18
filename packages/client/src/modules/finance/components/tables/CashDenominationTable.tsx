import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

// Iconos
import EditIcon from "@mui/icons-material/Edit";
//import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save"; // Opcional, por si prefieres icono de disco

// Tipos
import type { CashDenomination } from "@modules/finance/types/cash-denomination.type";

interface Props {
  data: CashDenomination[];
  onSave: (id: number, quantity: number) => void;
  isLoading?: boolean;
  headerColor?: string; // Para diferenciar Billetes (verde) de Monedas (azul/gris)
  title: string;
}

export default function CashDenominationTable({
  data,
  onSave,
  isLoading,
  headerColor = "primary.main",
  title,
}: Props) {
  const [editId, setEditId] = useState<number | null>(null);
  const [tempQty, setTempQty] = useState<number>(0);

  // Iniciar edición
  const handleEditClick = (row: CashDenomination) => {
    setEditId(row.id);
    setTempQty(row.quantity);
  };

  // Guardar cambios
  const handleSave = (id: number) => {
    if (tempQty < 0) return; // Validación básica
    onSave(id, tempQty);
    setEditId(null);
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditId(null);
    setTempQty(0);
  };

  // Manejar tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === "Enter") {
      handleSave(id);
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Calcular total de la tabla actual para mostrar en el pie (opcional)
  const tableTotal = data.reduce(
    (acc, row) => acc + parseFloat(row.denomination_value) * row.quantity,
    0,
  );

  return (
    <TableContainer
      component={Paper}
      elevation={2}
      sx={{
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Título integrado en la tabla */}
      <Box
        sx={{
          p: 2,
          bgcolor: headerColor,
          color: "white",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </Box>

      <Table size="small" aria-label={`tabla de ${title}`}>
        <TableHead sx={{ bgcolor: "grey.100" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Denominación</TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold", width: 120 }}>
              Cantidad
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold" }}>
              Total
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold", width: 100 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => {
            const isEditing = editId === row.id;
            const totalValue =
              parseFloat(row.denomination_value) * row.quantity;

            return (
              <TableRow
                key={row.id}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  bgcolor: isEditing ? "action.hover" : "inherit",
                }}
              >
                {/* Columna Denominación */}
                <TableCell component="th" scope="row">
                  <Typography fontWeight="medium">
                    {
                      parseFloat(row.denomination_value) >= 5
                        ? `${row.denomination_value} €` // Billetes suelen no llevar decimales visuales si son enteros
                        : `${parseFloat(row.denomination_value).toFixed(2)} €` // Monedas
                    }
                  </Typography>
                </TableCell>

                {/* Columna Cantidad (Editable) */}
                <TableCell align="center">
                  {isEditing ? (
                    <TextField
                      value={tempQty}
                      onChange={(e) => setTempQty(Number(e.target.value))}
                      onKeyDown={(e) => handleKeyDown(e, row.id)}
                      type="number"
                      size="small"
                      autoFocus
                      variant="standard" // Más limpio dentro de una celda
                      slotProps={{
                        htmlInput: { min: 0, style: { textAlign: "center" } },
                      }}
                      sx={{ width: 60 }}
                    />
                  ) : (
                    <Typography>{row.quantity}</Typography>
                  )}
                </TableCell>

                {/* Columna Total Calculado */}
                <TableCell align="right" sx={{ fontFamily: "monospace" }}>
                  {totalValue.toFixed(2)} €
                </TableCell>

                {/* Columna Acciones */}
                <TableCell align="center">
                  {isEditing ? (
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Tooltip title="Guardar">
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => handleSave(row.id)}
                        >
                          <SaveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancelar">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={handleCancel}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(row)}
                        disabled={
                          isLoading || (editId !== null && editId !== row.id)
                        }
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Footer de la tabla individual */}
      <Box
        sx={{
          p: 2,
          mt: "auto",
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Subtotal
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          {tableTotal.toFixed(2)} €
        </Typography>
      </Box>
    </TableContainer>
  );
}
