import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  useReadCashDenominations,
  useUpdateCashDenomination,
} from "../hooks/useCashDenomination";
import CashDenominationTable from "../components/tables/CashDenominationTable";

export const CashDenominationPage: React.FC = () => {
  const {
    data: denominations = [],
    isLoading,
    isError,
    error,
  } = useReadCashDenominations();
  const updateMutation = useUpdateCashDenomination();

  // Filtrado por rangos de ID según requerimiento
  const bills = useMemo(
    () =>
      denominations
        .filter((d) => d.id >= 1 && d.id <= 7)
        .sort((a, b) => a.id - b.id),
    [denominations]
  );
  const coins = useMemo(
    () =>
      denominations
        .filter((d) => d.id >= 8 && d.id <= 15)
        .sort((a, b) => a.id - b.id),
    [denominations]
  );

  // Cálculo del Gran Total sumando (valor * cantidad) de todos los elementos
  const grandTotal = useMemo(() => {
    return denominations.reduce((acc, curr) => {
      const val = parseFloat(curr.denomination_value) || 0;
      return acc + val * curr.quantity;
    }, 0);
  }, [denominations]);

  const handleUpdateQuantity = (id: number, quantity: number) => {
    updateMutation.mutate({ id, quantity });
  };

  if (isLoading)
    return (
      <Box
        p={4}
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <CircularProgress />
        <Typography mt={2}>Cargando datos del arqueo...</Typography>
      </Box>
    );

  if (isError)
    return (
      <Box p={3}>
        <Alert severity="error">
          Error al cargar denominaciones: {error?.message}
        </Alert>
      </Box>
    );

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Arqueo de Caja
      </Typography>

      {updateMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al actualizar: {updateMutation.error.message}
        </Alert>
      )}

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          width: "100%",
          maxWidth: "1200px",
          mx: "auto",
        }}
      >
        {/* TABLA 1: BILLETES */}
        <Typography variant="h6" color="primary.main" gutterBottom>
          💵 Billetes
        </Typography>
        <CashDenominationTable
          data={bills}
          onSave={handleUpdateQuantity}
          isLoading={updateMutation.isPending}
        />

        <Divider sx={{ my: 4, borderBottomWidth: 2 }} />

        {/* TABLA 2: MONEDAS */}
        <Typography variant="h6" color="secondary.main" gutterBottom>
          🪙 Monedas
        </Typography>
        <CashDenominationTable
          data={coins}
          onSave={handleUpdateQuantity}
          isLoading={updateMutation.isPending}
        />

        {/* SECCIÓN DE GRAN TOTAL */}
        <Box
          mt={4}
          p={3}
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          sx={{
            bgcolor: "primary.light",
            color: "primary.contrastText",
            borderRadius: 1,
          }}
        >
          <Typography variant="h5" fontWeight="bold" mr={2}>
            TOTAL ARQUEO:
          </Typography>
          <Typography variant="h3" fontWeight="black">
            {grandTotal.toFixed(2)} €
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
