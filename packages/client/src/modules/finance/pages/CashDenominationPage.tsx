import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid, // Usamos Grid para el layout horizontal
  Divider,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate"; // Icono decorativo
import {
  useReadCashDenominations,
  useUpdateCashDenomination,
} from "@modules/finance/hooks/useCashDenomination";
import CashDenominationTable from "@modules/finance/components/tables/CashDenominationTable";

const CashDenominationPage: React.FC = () => {
  const {
    data: denominations = [],
    isLoading,
    isError,
    error,
  } = useReadCashDenominations();
  const updateMutation = useUpdateCashDenomination();

  // Filtrado por rangos de ID
  const bills = useMemo(
    () =>
      denominations
        .filter((d) => d.id >= 1 && d.id <= 7)
        .sort((a, b) => a.id - b.id),
    [denominations],
  );

  const coins = useMemo(
    () =>
      denominations
        .filter((d) => d.id >= 8 && d.id <= 15)
        .sort((a, b) => a.id - b.id),
    [denominations],
  );

  // Cálculo del Gran Total
  const grandTotal = useMemo(() => {
    return denominations.reduce((acc, curr) => {
      const val = curr.denomination_value || 0;
      return acc + val * curr.quantity;
    }, 0);
  }, [denominations]);

  const handleUpdateQuantity = (id: number, quantity: number) => {
    updateMutation.mutate({ id, quantity });
  };

  if (isLoading)
    return (
      <Box
        p={{ xs: 2, sm: 4 }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        minHeight="50vh"
      >
        <CircularProgress />
        <Typography mt={2}>Cargando datos del arqueo...</Typography>
      </Box>
    );

  if (isError)
    return (
      <Box p={{ xs: 2, sm: 3 }}>
        <Alert severity="error">
          Error al cargar denominaciones: {error?.message}
        </Alert>
      </Box>
    );

  return (
    <Box p={{ xs: 1, sm: 2, md: 3 }} sx={{ maxWidth: "1400px", mx: "auto" }}>
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        mb={3}
        gap={2}
      >
        <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" } }}>
          Arqueo de Caja
        </Typography>

        <Paper
          elevation={3}
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1,
            bgcolor: "primary.dark",
            color: "white",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
          }}
        >
          <CalculateIcon fontSize="small" />
          <Box textAlign="right">
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              TOTAL FINAL
            </Typography>
            <Typography variant="h5" fontWeight="bold" lineHeight={1}>
              {grandTotal.toFixed(2)} €
            </Typography>
          </Box>
        </Paper>
      </Box>

      {updateMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al actualizar: {updateMutation.error.message}
        </Alert>
      )}

      {/* LAYOUT PRINCIPAL: GRID */}
      <Grid container spacing={3}>
        {/* Columna Izquierda: BILLETES */}
        <Grid sx={{ xs: 12, md: 6 }}>
          <CashDenominationTable
            title="💵 Billetes"
            data={bills}
            onSave={handleUpdateQuantity}
            isLoading={updateMutation.isPending}
            headerColor="success.main" // Color Verde para dinero/billetes
          />
        </Grid>

        <Divider sx={{ my: 4, borderBottomWidth: 2 }} />

        {/* Columna Derecha: MONEDAS */}
        <Grid sx={{ xs: 12, md: 6 }}>
          <CashDenominationTable
            title="🪙 Monedas"
            data={coins}
            onSave={handleUpdateQuantity}
            isLoading={updateMutation.isPending}
            headerColor="secondary.main" // Color distinto para separar visualmente
          />
        </Grid>
      </Grid>

      {/* Resumen Final Grande (Opcional si ya está arriba, pero bueno para imprimir) */}
      <Box mt={4} display="flex" justifyContent="flex-end">
        <Typography variant="body2" color="text.secondary">
          * Recuerda verificar el conteo físico antes de cerrar caja.
        </Typography>
      </Box>
    </Box>
  );
};

export default CashDenominationPage;
