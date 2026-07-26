import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
  Button,
} from "@mui/material";

// Iconos
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PaymentsIcon from "@mui/icons-material/Payments";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ClearIcon from "@mui/icons-material/Clear";

import useBillController from "@modules/cafeteria/controllers/useBillController";
import { TicketModal } from "@modules/cafeteria/components/modals/TicketModal";
import type { BillType } from "@economic-control/shared";

export type BillItem = BillType & {
  created_at: string | null;
};

// Función auxiliar para formatear la fecha a YYYY-MM-DD
const formatDateToISO = (dateVal?: string | Date | null): string => {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function BillsPage() {
  const {
    bills,
    isLoading,
    isError,
    error,
    deleteBill,
    isActionPending,
    actionError,
  } = useBillController();

  const [searchTerm, setSearchTerm] = useState("");
  // Estado para la fecha seleccionada (por defecto vacía = mostrar todo)
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedBillForTicket, setSelectedBillForTicket] = useState<BillItem | null>(null);

  // Abrir Modal para reimprimir
  const handleOpenPrintModal = (bill: BillItem) => {
    setSelectedBillForTicket(bill);
  };

  const handleCloseTicketModal = () => {
    setSelectedBillForTicket(null);
  };

  // Filtrado de facturas por ID, Método de Pago Y Fecha de Venta
  const filteredBills = useMemo(() => {
    return (bills as BillItem[]).filter((b) => {
      // 1. Filtro por Fecha
      if (selectedDate) {
        const billDateStr = formatDateToISO(b.created_at || b.date);
        if (billDateStr !== selectedDate) {
          return false;
        }
      }

      // 2. Filtro por Texto (N° Factura o Forma de Pago)
      const term = searchTerm.toLowerCase();
      const idMatch = b.id?.toString().includes(term);
      const payMatch = b.pay_method?.toLowerCase().includes(term);

      return idMatch || payMatch;
    });
  }, [bills, searchTerm, selectedDate]);

  // Cálculo dinámico de Totales de Venta
  const totals = useMemo(() => {
    return filteredBills.reduce(
      (acc, bill) => {
        const amount = Number(bill.amount || 0);

        // Sumar según forma de pago
        if (bill.pay_method === "Efectivo") {
          acc.efectivo += amount;
        } else if (bill.pay_method === "Tarjeta") {
          acc.tarjeta += amount;
        }

        acc.total += amount;
        return acc;
      },
      { efectivo: 0, tarjeta: 0, total: 0 }
    );
  }, [filteredBills]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100vh", width: "100%", boxSizing: "border-box" }}>
      {/* Cabecera */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <ReceiptLongIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold" color="#0f172a">
              Historial de Facturación
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Consulta facturas emitidas, desglose de ventas diarias y reimpresiones
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Alertas de error */}
      {(isError || actionError) && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error?.message || actionError}
        </Alert>
      )}

      {/* TARJETAS DE RESUMEN / TOTALES */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        {/* Total Efectivo */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            bgcolor: "#f0fdf4", // Verde suave
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "#dcfce7",
              color: "#16a34a",
              display: "flex",
            }}
          >
            <PaymentsIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="caption" fontWeight="bold" color="#15803d">
              EFECTIVO
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="#166534">
              {totals.efectivo.toFixed(2)}€
            </Typography>
          </Box>
        </Paper>

        {/* Total Tarjeta */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            bgcolor: "#eff6ff", // Azul suave
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "#dbeafe",
              color: "#2563eb",
              display: "flex",
            }}
          >
            <CreditCardIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="caption" fontWeight="bold" color="#1d4ed8">
              TARJETA
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="#1e40af">
              {totals.tarjeta.toFixed(2)}€
            </Typography>
          </Box>
        </Paper>

        {/* Total Ventas Generales */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            bgcolor: "#faf5ff", // Púrpura suave
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "#f3e8ff",
              color: "#9333ea",
              display: "flex",
            }}
          >
            <PointOfSaleIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="caption" fontWeight="bold" color="#7e22ce">
              TOTAL VENTAS
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="#6b21a8">
              {totals.total.toFixed(2)}€
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* PANEL DE FILTROS Y TABLA */}
      <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3, overflow: "hidden" }}>
        {/* Barra de Filtros */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" sx={{ width: { xs: "100%", sm: "auto" } }}>
            {/* Filtro Texto */}
            <TextField
              placeholder="Buscar por N° Factura o Forma de Pago..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 280 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Filtro Fecha */}
            <TextField
              type="date"
              size="small"
              label="Fecha de venta"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Botón para Limpiar Fecha */}
            {selectedDate && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={() => setSelectedDate("")}
                startIcon={<ClearIcon />}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Todas las fechas
              </Button>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" fontWeight="600">
            {filteredBills.length} factura(s) encontrada(s)
          </Typography>
        </Box>

        {/* Tabla */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={5}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>N° Factura (ID)</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Fecha Emisión</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Forma de Pago</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">Monto Total</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5, color: "text.secondary" }}>
                      No se encontraron facturas para la fecha o criterio seleccionado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBills.map((bill) => (
                    <TableRow key={bill.id} hover>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        #{bill.id?.toString().padStart(6, "0")}
                      </TableCell>
                      <TableCell color="text.secondary">
                        {bill.created_at || bill.date
                          ? new Date(bill.created_at || bill.date).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={bill.pay_method}
                          color={bill.pay_method === "Efectivo" ? "success" : "info"}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: "primary.main", fontSize: "1rem" }}>
                        {Number(bill.amount || 0).toFixed(2)}€
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Re-imprimir Ticket">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenPrintModal(bill)}
                            size="small"
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar Factura">
                          <IconButton
                            color="error"
                            onClick={() => bill.id && deleteBill(bill.id)}
                            disabled={isActionPending}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Modal Reutilizable de Ticket */}
      <TicketModal
        isOpen={Boolean(selectedBillForTicket)}
        bill={selectedBillForTicket as any}
        onClose={handleCloseTicketModal}
      />
    </Box>
  );
}