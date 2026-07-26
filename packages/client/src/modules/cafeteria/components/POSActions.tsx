import { useState } from "react";
import { Box, Button, Typography, Divider, Badge } from "@mui/material";

import PauseIcon from "@mui/icons-material/Pause";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

import HeldOrdersModal from "./modals/HeldOrdersModal";
import type { HeldOrder } from "../types/POSCartItem";

interface POSActionsProps {
  total: number;
  onSave: () => void;
  isLoading?: boolean;
  // Props para los pedidos pausados
  heldOrders: HeldOrder[];
  onHoldOrder: () => void;
  onRestoreOrder: (orderId: string) => void;
  onDeleteHeldOrder: (orderId: string) => void;
  hasCartItems: boolean;
}

export default function POSActions({
  total,
  onSave,
  isLoading = false,
  heldOrders,
  onHoldOrder,
  onRestoreOrder,
  onDeleteHeldOrder,
  hasCartItems,
}: POSActionsProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Box p={2.5}>
      {/* Botón para abrir modal de pedidos en espera */}
      <Button
        fullWidth
        variant="outlined"
        color="warning"
        startIcon={
          <Badge badgeContent={heldOrders.length} color="error">
            <PendingActionsIcon />
          </Badge>
        }
        onClick={() => setModalOpen(true)}
        sx={{ mb: 2 }}
      >
        Pedidos en Espera ({heldOrders.length})
      </Button>

      <Typography variant="h5" sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
        <span>Total:</span>
        <Typography variant="h4" component="strong" color="primary">
          ${total.toFixed(2)}
        </Typography>
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Box display="flex" flexDirection="column" gap={1.5}>
        {/* Botón Cobrar */}
        <Button
          fullWidth
          variant="contained"
          color="success"
          size="large"
          onClick={onSave}
          disabled={isLoading || total === 0}
          sx={{ py: 1.8, fontSize: "1.1rem", fontWeight: "bold" }}
        >
          {isLoading ? "Procesando..." : "Cobrar Orden"}
        </Button>

        {/* Botón Pausar/Guardar Pedido */}
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<PauseIcon />}
          onClick={() => onHoldOrder()}
          disabled={!hasCartItems}
        >
          Pausar Pedido
        </Button>
      </Box>

      {/* Modal para ver/recuperar pedidos */}
      <HeldOrdersModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        heldOrders={heldOrders}
        onRestore={onRestoreOrder}
        onDelete={onDeleteHeldOrder}
      />
    </Box>
  );
}