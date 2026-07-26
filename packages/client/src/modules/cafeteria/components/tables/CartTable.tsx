import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  TextField,
  Tooltip,
  Button,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";

import type { POSCartItem } from "../../types/POSCartItem";

interface CartTableProps {
  items: POSCartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
}

export default function CartTable({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartTableProps) {
  if (items.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          p: 5,
          textAlign: "center",
          backgroundColor: "background.default",
          borderRadius: 2,
          border: "2px dashed",
          borderColor: "divider",
        }}
      >
        <RemoveShoppingCartIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
        <Typography variant="h6" color="text.secondary">
          El pedido está vacío
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} px={1}>
        <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
          Detalle de la Orden ({items.length} {items.length === 1 ? "ítem" : "ítems"})
        </Typography>
        <Button size="small" color="error" onClick={onClearCart} startIcon={<DeleteOutlineIcon />}>
          Vaciar Tabla
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 420 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "action.hover" }}>Producto</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", bgcolor: "action.hover", width: "160px" }}>Cantidad</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "action.hover" }}>P. Unitario</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "action.hover" }}>Subtotal</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", bgcolor: "action.hover", width: "60px" }}>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const productId = item.id!;

              return (
                <TableRow key={productId} hover>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="bold">
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cód: {item.code}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                        <IconButton 
                            size="small" 
                            onClick={() => onUpdateQuantity(item.id? item.id : 0, item.quantity - 1)}
                            sx={{ border: "1px solid #cbd5e1", borderRadius: 1.5, p: 0.5 }}
                        >
                            <RemoveIcon fontSize="small" />
                        </IconButton>

                        {/* 💡 ESTE TEXTFIELD DEBE TENER UN ANCHO MÍNIMO DE 45px - 50px */}
                        <TextField
                            size="small"
                            value={item.quantity}
                            onChange={(e) => onUpdateQuantity(item.id? item.id : 0, Number(e.target.value))}
                            slotProps={{
                            htmlInput: {
                                style: {
                                textAlign: "center",
                                padding: "4px 8px",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                },
                            },
                            }}
                            sx={{ 
                            width: "50px", // 👈 Ancho suficiente para ver '1', '10', '100'
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 1.5,
                            } 
                            }}
                        />

                        <IconButton 
                            size="small" 
                            onClick={() => onUpdateQuantity(item.id? item.id : 0, item.quantity + 1)}
                            sx={{ border: "1px solid #cbd5e1", borderRadius: 1.5, p: 0.5 }}
                        >
                            <AddIcon fontSize="small" />
                        </IconButton>
                        </Box>
                  </TableCell>

                  <TableCell align="right">${item.unit_price.toFixed(2)}</TableCell>

                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    ${item.subtotal.toFixed(2)}
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="Eliminar del pedido">
                      <IconButton size="small" color="error" onClick={() => onRemoveItem(productId)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}