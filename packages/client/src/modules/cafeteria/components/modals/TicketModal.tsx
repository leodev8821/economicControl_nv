import React, { useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";

import usePrintConfigController from "@modules/cafeteria/controllers/usePrintConfigController";

interface TicketModalProps {
  isOpen: boolean;
  bill: any | null;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, bill, onClose }) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const { currentConfig: config } = usePrintConfigController();

  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  // Formateador de moneda
  const formatMoney = (amount: number | string | undefined | null): string => {
    const num = Number(amount ?? 0);
    return isNaN(num) 
      ? "0,00" 
      : num.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const anchoPapel = config?.ancho_papel || 80;
  // Soporte para tamaño de letra según tu configuración de la BD (1 o 2)
  const fontSizeFactor = config?.font_size === 2 ? "1.2em" : "1em";

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        },
      }}
    >
      {/* CABECERA DEL MODAL (No se imprime) */}
      <DialogTitle
        className="no-print"
        sx={{
          m: 0,
          p: 2,
          bgcolor: "#1e293b",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.95rem",
          fontWeight: 600,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <span>🧾</span>
          <span>Vista Previa del Ticket</span>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: "white", p: 0.5 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* CUERPO DEL MODAL / TICKET */}
      <DialogContent
        sx={{
          bgcolor: "#f1f5f9",
          p: 3,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* PAPEL TÉRMICO IMPRIMIBLE */}
        <Box
          id="printable-ticket"
          ref={ticketRef}
          sx={{
            bgcolor: "white",
            p: 2.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            fontFamily: '"Arial", sans-serif',
            fontSize: fontSizeFactor,
            lineHeight: 1.3,
            color: "#000",
            width: `${anchoPapel}mm`,
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* LOGO (Si existe en la configuración) */}
          {(config?.logo_data) && (
            <Box textAlign="center" mb={1}>
              <img 
                src={config.logo_data} 
                alt="Logo" 
                style={{ maxWidth: "100px", margin: "0 auto", display: "block" }} 
              />
            </Box>
          )}

          {/* 1. DATOS DEL NEGOCIO */}
          <Box textAlign="center" mb={1}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: "bold",
                fontFamily: "inherit",
                fontSize: "1.1em",
                textTransform: "uppercase",
              }}
            >
              {config?.nombre_negocio || "MI NEGOCIO"}
            </Typography>
            {config?.direccion && (
              <Typography variant="caption" display="block" sx={{ fontFamily: "inherit", fontSize: "0.85em" }}>
                {config.direccion}
              </Typography>
            )}
            {config?.telefono && (
              <Typography variant="caption" display="block" sx={{ fontFamily: "inherit", fontSize: "0.85em" }}>
                Tel: {config.telefono}
              </Typography>
            )}
            {(config?.cif) && (
              <Typography variant="caption" display="block" sx={{ fontFamily: "inherit", fontSize: "0.85em" }}>
                CIF: {config.cif}
              </Typography>
            )}
          </Box>

          <Divider sx={{ borderStyle: "dashed", my: 1.5, borderColor: "#000" }} />

          {/* 2. DATOS DE LA FACTURA Y CLIENTE */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, fontSize: "0.9em" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600 }}>Factura Nº:</span>
              <span style={{ fontWeight: "bold" }}>#{bill?.id ?? "-"}</span>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600 }}>Fecha:</span>
              <span>{new Date(bill?.date || bill?.fecha || Date.now()).toLocaleString("es-ES")}</span>
            </Box>
            {bill?.direccion && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>Dirección:</span>
                <span>{bill.direccion}</span>
              </Box>
            )}
          </Box>

          <Divider sx={{ borderStyle: "dashed", my: 1.5, borderColor: "#000" }} />

          {/* 3. LISTA DE PRODUCTOS */}
          <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", mb: 1, borderBottom: "1px solid #000", pb: 0.5, fontSize: "0.9em" }}>
            <span>Descripción</span>
            <span>Importe</span>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {(bill?.Details || bill?.details || bill?.detalles || []).map((d: any, idx: number) => {
              const nombreProd = d?.Product?.name || d?.producto_nombre || `Producto #${d?.product_id}`;
              const cantidad = Number(d?.quantity || d?.cantidad || 0);
              const precioU = Number(d?.unit_price || d?.precio_unitario || 0);
              const subtotal = Number(d?.subtotal || cantidad * precioU);

              return (
                <Box 
                  key={idx} 
                  sx={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    pageBreakInside: "avoid", 
                    breakInside: "avoid" 
                  }}
                >
                  <span style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.9em" }}>
                    {nombreProd}
                  </span>
                  <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.85em" }}>
                    <span style={{ color: "#333" }}>{cantidad} x ${formatMoney(precioU)}</span>
                    <span style={{ fontWeight: "bold" }}>${formatMoney(subtotal)}</span>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Divider sx={{ borderStyle: "dashed", my: 1.5, borderColor: "#000" }} />

          {/* 4. TOTALES Y MÉTODO DE PAGO */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "bold", fontSize: "1.1em" }}>
            <span>TOTAL:</span>
            <span>${formatMoney(bill?.amount || bill?.total)}</span>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5, fontSize: "0.9em" }}>
            <span style={{ fontWeight: 600 }}>Forma de pago:</span>
            <span style={{ textTransform: "uppercase" }}>{bill?.pay_method || bill?.forma_pago || "Efectivo"}</span>
          </Box>

          {/* CÓDIGO QR (Si existe en la configuración) */}
          {(config?.qr_data) && (
            <Box textAlign="center" my={2}>
              <img 
                src={config.qr_data} 
                alt="Código QR" 
                style={{ maxWidth: "120px", margin: "0 auto", display: "block" }} 
              />
            </Box>
          )}

          <Divider sx={{ borderStyle: "dashed", my: 1.5, borderColor: "#000" }} />

          {/* 5. PIE DE PÁGINA */}
          <Box textAlign="center" sx={{ fontSize: "0.8em", textTransform: "uppercase", color: "#333", pt: 0.5 }}>
            {config?.pie_pagina || "¡Gracias por su compra!"}
          </Box>
        </Box>
      </DialogContent>

      {/* BOTONES DE ACCIÓN (No se imprimen) */}
      <DialogActions className="no-print" sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
        <Button onClick={onClose} variant="outlined" color="inherit" size="small">
          Cerrar
        </Button>
        <Button onClick={handlePrint} variant="contained" color="primary" size="small" startIcon={<PrintIcon />}>
          Imprimir
        </Button>
      </DialogActions>

      {/* REGLAS CSS CORREGIDAS PARA IMPRESIÓN */}
      <style>{`
        @media print {
          /* Configura el tamaño del papel térmico en el diálogo del navegador */
          @page {
            size: ${anchoPapel}mm auto;
            margin: 0mm 0mm 8mm 0mm;
          }

          /* Oculta la vista normal del navegador */
          body * {
            visibility: hidden !important;
          }

          /* Desactiva fondos, sombras y cabeceras de Material UI sin destruir el DOM del modal */
          .MuiDialog-root,
          .MuiDialog-container,
          .MuiPaper-root,
          .MuiDialogContent-root {
            visibility: visible !important;
            position: static !important;
            overflow: visible !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          /* Oculta la cabecera del modal, los botones y el fondo oscuro */
          .no-print,
          .MuiBackdrop-root,
          .MuiDialogTitle-root,
          .MuiDialogActions-root {
            display: none !important;
          }

          /* Muestra e imprime ÚNICAMENTE el ticket */
          #printable-ticket, #printable-ticket * {
            visibility: visible !important;
          }

          #printable-ticket {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${anchoPapel}mm !important;
            max-width: ${anchoPapel}mm !important;
            margin: 0 !important;
            padding: 3mm 3mm 8mm 3mm !important;
            box-shadow: none !important;
            background: #fff !important;
            color: #000 !important;
          }
        }
      `}</style>
    </Dialog>
  );
};