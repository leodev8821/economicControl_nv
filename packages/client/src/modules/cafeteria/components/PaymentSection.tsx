import React from "react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
} from "@mui/material";

// Iconos MUI
import PaymentsIcon from "@mui/icons-material/Payments";
import CreditCardIcon from "@mui/icons-material/CreditCard";

// Tipos desde tu fuente de verdad en Zod
import { PAYMENT_METHODS, type PaymentMethod } from "@economic-control/shared";

interface PaymentSectionProps {
  payMethod: PaymentMethod;
  onChangePayMethod: (method: PaymentMethod) => void;
  amountTendered: number;
  onChangeAmountTendered: (amount: number) => void;
  cartTotal: number;
}

export default function PaymentSection({
  payMethod,
  onChangePayMethod,
  amountTendered,
  onChangeAmountTendered,
  cartTotal,
}: PaymentSectionProps) {
  
  const handleMethodChange = (_: React.MouseEvent<HTMLElement>, newMethod: PaymentMethod | null) => {
    if (newMethod !== null) {
      onChangePayMethod(newMethod);
    }
  };

  // Cálculo del vuelto / cambio
  const changeDue = Math.max(0, amountTendered - cartTotal);

  return (
    <Box sx={{ width: "100%", boxSizing: "border-box" }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: "#1e293b" }}>
        Forma de Pago
      </Typography>

      {/* Botones de selección rápida */}
      <ToggleButtonGroup
        color="primary"
        value={payMethod}
        exclusive
        onChange={handleMethodChange}
        fullWidth
        sx={{ mb: 2 }}
      >
        {PAYMENT_METHODS.map((method) => (
          <ToggleButton 
            key={method} 
            value={method} 
            sx={{ 
              py: 1.2, 
              px: 1,
              gap: 0.8,
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "none",
              whiteSpace: "nowrap"
            }}
          >
            {method === "Efectivo" ? (
              <PaymentsIcon fontSize="small" />
            ) : (
              <CreditCardIcon fontSize="small" />
            )}
            {method}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Control de cambio para Efectivo */}
      {payMethod === "Efectivo" && (
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          <TextField
            label="Efectivo Recibido"
            type="number"
            size="small"
            value={amountTendered === 0 ? "" : amountTendered}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onChangeAmountTendered(isNaN(val) ? 0 : val);
            }}
            slotProps={{
              htmlInput: { min: 0, step: "any" },
            }}
            fullWidth
          />

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            bgcolor="#f1f5f9"
            p={1.5}
            borderRadius={2}
          >
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              Cambio / Vuelto:
            </Typography>
            <Typography variant="h6" color="success.main" fontWeight="800">
              ${changeDue.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}