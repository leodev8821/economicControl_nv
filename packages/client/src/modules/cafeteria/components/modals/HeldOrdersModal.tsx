import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Box,
  Chip,
  Divider,
} from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestoreIcon from "@mui/icons-material/Restore";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";

import type { HeldOrder } from "@modules/cafeteria/types/POSCartItem";

interface HeldOrdersModalProps {
  open: boolean;
  onClose: () => void;
  heldOrders: HeldOrder[];
  onRestore: (orderId: string) => void;
  onDelete: (orderId: string) => void;
}

export default function HeldOrdersModal({
  open,
  onClose,
  heldOrders,
  onRestore,
  onDelete,
}: HeldOrdersModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle display="flex" alignItems="center" gap={1}>
        <PauseCircleIcon color="warning" />
        Pedidos en Espera / Pausados ({heldOrders.length})
      </DialogTitle>

      <DialogContent dividers>
        {heldOrders.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              No hay ningún pedido guardado en espera.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {heldOrders.map((order, index) => (
              <React.Fragment key={order.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{ py: 1.5 }}
                  secondaryAction={
                    <Box display="flex" gap={1}>
                      <IconButton
                        color="error"
                        onClick={() => onDelete(order.id)}
                        size="small"
                        title="Eliminar pedido"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>

                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<RestoreIcon />}
                        onClick={() => {
                          onRestore(order.id);
                          onClose();
                        }}
                      >
                        Recuperar
                      </Button>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {order.note}
                        </Typography>
                        <Chip
                          label={`$${order.total.toFixed(2)}`}
                          color="success"
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box component="span" display="flex" flexDirection="column" gap={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Hora: {order.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} | {order.items.length} ítems
                        </Typography>
                        <Typography variant="body2" color="text.primary" sx={{ fontStyle: "italic" }}>
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < heldOrders.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}