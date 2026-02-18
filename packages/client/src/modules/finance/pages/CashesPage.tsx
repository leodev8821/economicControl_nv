import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Divider,
  Alert,
  Tab,
  Tabs,
} from "@mui/material";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import CalculateIcon from "@mui/icons-material/Calculate";
import type { GridRowId } from "@mui/x-data-grid";

// Hooks de Cashes (Cajas/Cuentas)
import {
  useCashes,
  useCreateCash,
  useUpdateCash,
  useDeleteCash,
} from "@modules/finance/hooks/useCash";

// Hooks de Denominaciones (Arqueo)
import {
  useReadCashDenominations,
  useUpdateCashDenomination,
} from "@modules/finance/hooks/useCashDenomination";

// Componentes
import CashTable from "@modules/finance/components/tables/CashTable";
import CashForm from "@modules/finance/components/forms/CashForm";
import CashDenominationTable from "@modules/finance/components/tables/CashDenominationTable"; // Asegúrate de que la ruta sea correcta

// Tipos
import type { Cash } from "@modules/finance/types/cash.type";
import type { CashUpdateData } from "@modules/finance/api/cashApi";
import * as SharedCashSchemas from "@economic-control/shared";

const CashesPage: React.FC = () => {
  // --- 1. Estado para la Caja Seleccionada ---
  // Por defecto empezamos con la caja 1 (General)
  const [selectedCashId, setSelectedCashId] = useState<number>(1);
  const [editingCash, setEditingCash] = useState<Cash | null>(null);

  // --- 2. Lógica de CASHES (Listado) ---
  const {
    data: cashes = [],
    isLoading: isLoadingCashes,
    isError: isErrorCashes,
  } = useCashes();

  const createCashMutation = useCreateCash();
  const updateCashMutation = useUpdateCash();
  const deleteCashMutation = useDeleteCash();

  // --- 3. Lógica de DENOMINATIONS (Arqueo) ---
  // Pasamos el selectedCashId al hook
  const {
    data: denominations = [],
    isLoading: isLoadingDenom,
    isError: isErrorDenom,
    error: errorDenom,
  } = useReadCashDenominations(selectedCashId); // <-- Hook actualizado

  const updateDenomMutation = useUpdateCashDenomination();

  // 3.1 Procesamiento robusto: Filtramos por valor, no por ID
  const bills = useMemo(
    () =>
      denominations
        .filter((d) => d.denomination_value >= 5)
        .sort((a, b) => b.denomination_value - a.denomination_value), // Mayor a menor
    [denominations],
  );

  const coins = useMemo(
    () =>
      denominations
        .filter((d) => d.denomination_value < 5)
        .sort((a, b) => b.denomination_value - a.denomination_value),
    [denominations],
  );

  // 3.2 Total del sistema SOLO de la caja seleccionada
  const selectedCashSystemTotal = useMemo(() => {
    const activeCash = cashes.find((c) => c.id === selectedCashId);
    return Number(activeCash?.actual_amount) || 0;
  }, [cashes, selectedCashId]);

  const grandTotal = useMemo(() => {
    return denominations.reduce(
      (acc, curr) => acc + curr.denomination_value * curr.quantity,
      0,
    );
  }, [denominations]);

  const difference = grandTotal - selectedCashSystemTotal;
  const isBalanced = Math.abs(difference) < 0.01;

  // --- Handlers ---
  const handleCashChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedCashId(newValue);
  };

  const handleUpdateDenominationQty = (id: number, quantity: number) => {
    updateDenomMutation.mutate({ id, quantity });
  };

  // --- Handlers de CASHES ---
  const handleCreateCash = (
    cashData: SharedCashSchemas.CashCreationRequest,
  ) => {
    createCashMutation.mutate(cashData);
  };

  const handleUpdateCash = (cashData: CashUpdateData) => {
    updateCashMutation.mutate(cashData, {
      onSuccess: () => setEditingCash(null),
    });
  };

  const handleFormSubmit = (data: SharedCashSchemas.CashCreationRequest) => {
    if (editingCash) {
      handleUpdateCash({ ...data, id: editingCash.id });
    } else {
      handleCreateCash(data);
    }
  };

  const handleStartEdit = (cash: Cash) => {
    setEditingCash(cash);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteCash = (id: GridRowId) => {
    const cashId = parseInt(id.toString());
    if (window.confirm(`¿Está seguro de eliminar la Caja con ID ${cashId}?`)) {
      deleteCashMutation.mutate(cashId);
    }
  };

  const handleCancelEdit = () => setEditingCash(null);

  // Loading global inicial
  if (isLoadingCashes && isLoadingDenom) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
        <Typography variant="h6" ml={2}>
          Cargando sistema financiero...
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3} sx={{ maxWidth: "1400px", mx: "auto" }}>
      {/* --- SECCIÓN 1: GESTIÓN DE CAJAS (CRUD) --- */}
      <Box mb={6}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Gestión de Cajas
        </Typography>

        {/* Feedback de mutaciones */}
        {(createCashMutation.isPending ||
          updateCashMutation.isPending ||
          deleteCashMutation.isPending) && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Procesando cambios en Cajas...
          </Alert>
        )}
        {(createCashMutation.isError ||
          updateCashMutation.isError ||
          deleteCashMutation.isError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error en Cajas: Operación fallida
          </Alert>
        )}

        {/* Formulario */}
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <CashForm
            initialValues={editingCash}
            onSubmit={handleFormSubmit}
            isLoading={
              createCashMutation.isPending || updateCashMutation.isPending
            }
            isUpdateMode={!!editingCash}
            onCancel={handleCancelEdit}
          />
        </Paper>

        {/* Listado de Cajas */}
        {!isLoadingCashes && !isErrorCashes && cashes.length > 0 && (
          <Paper
            elevation={2}
            sx={{ p: 0, borderRadius: 2, overflow: "hidden" }}
          >
            <Box
              p={2}
              bgcolor="grey.100"
              borderBottom={1}
              borderColor="divider"
            >
              <Typography variant="h6">
                Listado de Cajas Registradas ({cashes.length})
              </Typography>
            </Box>
            <CashTable
              cashes={cashes}
              onEdit={handleStartEdit}
              onDelete={handleDeleteCash}
              selectedCashId={selectedCashId} // <-- El estado del arqueo
              onSelect={(id) => setSelectedCashId(id)} // <-- Cambiar caja desde la tabla
            />
          </Paper>
        )}
      </Box>

      <Divider sx={{ my: 4, borderBottomWidth: 2 }} />

      {/* --- SECCIÓN 2: ARQUEO DE CAJA (Denominaciones) --- */}
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              Arqueo de Efectivo
            </Typography>
            {/* Selector de Caja para el Arqueo */}
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={selectedCashId}
                onChange={handleCashChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                {cashes.map((cash) => (
                  <Tab
                    key={cash.id}
                    value={cash.id}
                    label={cash.name.toUpperCase()}
                    icon={<PriceCheckIcon />}
                    iconPosition="start"
                  />
                ))}
              </Tabs>
            </Paper>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
              flexWrap="wrap"
              gap={2}
            >
              {/* Aquí usa selectedCashSystemTotal en lugar de systemTotal global */}
              <Paper
                elevation={2}
                sx={{ px: 3, py: 1, borderRadius: 2, bgcolor: "grey.100" }}
              >
                <Typography variant="caption" color="text.secondary">
                  TOTAL SISTEMA (
                  {cashes.find((c) => c.id === selectedCashId)?.name})
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {selectedCashSystemTotal.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </Typography>
              </Paper>

              {/* Cuadro: Total Sistema (Lo que debería haber) */}
              <Paper
                elevation={2}
                sx={{ px: 3, py: 1, borderRadius: 2, bgcolor: "grey.100" }}
              >
                <Typography variant="caption" color="text.secondary">
                  TOTAL CAJA
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {selectedCashSystemTotal.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </Typography>
              </Paper>

              {/* Cuadro: Diferencia (El "Chivato") */}
              <Paper
                elevation={4}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: isBalanced ? "success.main" : "error.main",
                  color: "white",
                  minWidth: "200px",
                  transition: "all 0.3s ease", // Animación suave al cambiar de color
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {isBalanced ? "ESTADO: CUADRADO" : "DIFERENCIA (DESCUADRE)"}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h4" fontWeight="bold">
                    {difference === 0 ? (
                      <PriceCheckIcon />
                    ) : (
                      `${difference.toFixed(2)} €`
                    )}
                  </Typography>
                </Box>
              </Paper>

              {/* Total Flotante */}
              <Paper
                elevation={4}
                sx={{
                  px: 3,
                  py: 1,
                  bgcolor: "primary.dark",
                  color: "white",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <CalculateIcon fontSize="large" />
                <Box textAlign="right">
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    TOTAL FÍSICO
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" lineHeight={1}>
                    {grandTotal.toFixed(2)} €
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>

        {updateDenomMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error al actualizar denominación
          </Alert>
        )}

        {isLoadingDenom ? (
          <Box py={4} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : isErrorDenom ? (
          <Alert severity="error">
            Error cargando denominaciones: {errorDenom?.message}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {/* Tabla Billetes */}
            <Grid sx={{ xs: 12, md: 6 }}>
              <CashDenominationTable
                title="💵 Billetes"
                data={bills}
                onSave={handleUpdateDenominationQty}
                isLoading={updateDenomMutation.isPending}
                headerColor="success.main"
              />
            </Grid>

            {/* Tabla Monedas */}
            <Grid sx={{ xs: 12, md: 6 }}>
              <CashDenominationTable
                title="🪙 Monedas"
                data={coins}
                onSave={handleUpdateDenominationQty}
                isLoading={updateDenomMutation.isPending}
                headerColor="secondary.main"
              />
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default CashesPage;
