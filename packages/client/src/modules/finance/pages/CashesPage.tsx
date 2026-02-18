import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Divider,
  Alert,
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
  // --- 1. Lógica de CASHES (Listado de Cajas) ---
  const {
    data: cashes = [],
    isLoading: isLoadingCashes,
    isError: isErrorCashes,
    //error: errorCashes,
  } = useCashes();
  const createCashMutation = useCreateCash();
  const updateCashMutation = useUpdateCash();
  const deleteCashMutation = useDeleteCash();

  const [editingCash, setEditingCash] = useState<Cash | null>(null);

  // --- 2. Lógica de DENOMINATIONS (Arqueo) ---
  // NOTA: En el futuro, aquí pasarías el ID de la caja seleccionada: useReadCashDenominations(selectedCashId)
  const {
    data: denominations = [],
    isLoading: isLoadingDenom,
    isError: isErrorDenom,
    error: errorDenom,
  } = useReadCashDenominations();

  /* TODO: Cuando actualice el backend, solo tendré que añadir un estado 
  const [selectedCashId, setSelectedCashId] = useState(...).
  Pasaré ese ID al hook: useReadCashDenominations(selectedCashId).
  La UI ya estará lista y no tendré que tocar el maquetado, solo la lógica de selección
  */

  const updateDenomMutation = useUpdateCashDenomination();

  // 2.1 Procesamiento de datos de Arqueo (Billetes vs Monedas)
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

  const grandTotal = useMemo(() => {
    return denominations.reduce((acc, curr) => {
      const val = parseFloat(curr.denomination_value) || 0;
      return acc + val * curr.quantity;
    }, 0);
  }, [denominations]);

  // 1. Calculamos cuánto dice el sistema que hay en total
  const systemTotal = useMemo(() => {
    return cashes.reduce(
      (acc, curr) => acc + (Number(curr.actual_amount) || 0),
      0,
    );
  }, [cashes]);

  // 2. Calculamos la diferencia
  const difference = grandTotal - systemTotal;
  const isBalanced = Math.abs(difference) < 0.01; // Usamos un margen pequeño por decimales

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
            <Typography variant="body2" color="text.secondary">
              Control de billetes y monedas físico (Caja Activa)
            </Typography>
          </Box>

          {/* Cuadro: Total Sistema (Lo que debería haber) */}
          <Paper
            elevation={2}
            sx={{ px: 3, py: 1, borderRadius: 2, bgcolor: "grey.100" }}
          >
            <Typography variant="caption" color="text.secondary">
              TOTAL CAJA
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {systemTotal.toLocaleString("es-ES", {
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
