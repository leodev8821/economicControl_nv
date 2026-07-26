import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  MenuItem,
} from "@mui/material";

// Iconos
import PrintIcon from "@mui/icons-material/Print";
import StoreIcon from "@mui/icons-material/Store";
import SettingsIcon from "@mui/icons-material/Settings";
import SaveIcon from "@mui/icons-material/Save";
import ReceiptIcon from "@mui/icons-material/Receipt";

import usePrintConfigController from "@modules/cafeteria/controllers/usePrintConfigController";
import type { PrintConfigUpdateDTO } from "@economic-control/shared";

export default function PrintConfigPage() {
  const {
    printConfigs,
    isLoading,
    isError,
    error,
    isActionPending,
    actionError,
    handleFormSubmit,
  } = usePrintConfigController();

  // Tomamos la primera configuración disponible (Singleton)
  const currentConfig = printConfigs[0] || null;

  // Estado local del formulario
  const [formData, setFormData] = useState<PrintConfigUpdateDTO>({
    nombre_negocio: "",
    cif: "",
    telefono: "",
    direccion: "",
    pie_pagina: "",
    ancho_papel: 80,
    font_size: 1,
    impresora_facturas: "",
    factura_imprime_servidor: false,
    factura_auto_print: false,
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sincronizar el formulario cuando cargue la configuración de la BD
  useEffect(() => {
    if (currentConfig) {
      setFormData({
        nombre_negocio: currentConfig.nombre_negocio || "",
        cif: currentConfig.cif || "",
        telefono: currentConfig.telefono || "",
        direccion: currentConfig.direccion || "",
        pie_pagina: currentConfig.pie_pagina || "",
        ancho_papel: currentConfig.ancho_papel ?? 80,
        font_size: currentConfig.font_size ?? 1,
        impresora_facturas: currentConfig.impresora_facturas || "",
        factura_imprime_servidor: currentConfig.factura_imprime_servidor ?? false,
        factura_auto_print: currentConfig.factura_auto_print ?? false,
      });
    }
  }, [currentConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    // Si existe la configuración, la actualizamos mediante el controller
    if (currentConfig?.id) {
      handleFormSubmit(formData);
      setSuccessMessage("Configuración de impresión guardada correctamente.");
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100vh", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <PrintIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h5" fontWeight="bold" color="#0f172a">
            Configuración de Impresión
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Personaliza los datos del ticket y las preferencias de tu impresora
          </Typography>
        </Box>
      </Box>

      {/* Alertas */}
      {(isError || actionError) && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error?.message || actionError}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 3, mb: 3 }}>
          {/* SECCIÓN 1: DATOS DEL NEGOCIO */}
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <StoreIcon color="action" />
            <Typography variant="h6" fontWeight="bold">
              Información del Negocio
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Estos datos aparecerán en la cabecera del ticket impreso.
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nombre del Negocio *"
                value={formData.nombre_negocio}
                onChange={(e) => setFormData({ ...formData, nombre_negocio: e.target.value })}
                required
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="CIF / NIF"
                value={formData.cif || ""}
                onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Teléfono de Contacto"
                value={formData.telefono || ""}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Dirección"
                value={formData.direccion || ""}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Pie de Página del Ticket"
                placeholder="Ej: ¡Gracias por su visita! Vuelva pronto."
                value={formData.pie_pagina || ""}
                onChange={(e) => setFormData({ ...formData, pie_pagina: e.target.value })}
                multiline
                rows={2}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* SECCIÓN 2: FORMATO DEL TICKET Y DISPOSITIVO */}
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <ReceiptIcon color="action" />
            <Typography variant="h6" fontWeight="bold">
              Formato de Papel e Impresora
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                label="Ancho del Papel"
                value={formData.ancho_papel}
                onChange={(e) => setFormData({ ...formData, ancho_papel: Number(e.target.value) })}
                fullWidth
                size="small"
              >
                <MenuItem value={80}>80 mm (Térmica Estándar)</MenuItem>
                <MenuItem value={58}>58 mm (Térmica Pequeña)</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Tamaño de Fuente"
                type="number"
                value={formData.font_size}
                onChange={(e) => setFormData({ ...formData, font_size: Number(e.target.value) })}
                slotProps={{ htmlInput: { min: 1, max: 3 } }}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Nombre Impresora Destino"
                placeholder="Ej: POS-80"
                value={formData.impresora_facturas || ""}
                onChange={(e) => setFormData({ ...formData, impresora_facturas: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* SECCIÓN 3: COMPORTAMIENTO AUTOMÁTICO */}
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <SettingsIcon color="action" />
            <Typography variant="h6" fontWeight="bold">
              Opciones de Impresión
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(formData.factura_auto_print)}
                  onChange={(e) => setFormData({ ...formData, factura_auto_print: e.target.checked })}
                  color="primary"
                />
              }
              label="Impresión Automática (Imprimir inmediatamente al cerrar una venta)"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(formData.factura_imprime_servidor)}
                  onChange={(e) => setFormData({ ...formData, factura_imprime_servidor: e.target.checked })}
                  color="primary"
                />
              }
              label="Imprimir directamente desde el servidor (vía drivers del sistema)"
            />
          </Box>
        </Paper>

        {/* Botón de Guardar */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isActionPending}
            startIcon={isActionPending ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ borderRadius: 2, px: 4, fontWeight: "bold" }}
          >
            {isActionPending ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}