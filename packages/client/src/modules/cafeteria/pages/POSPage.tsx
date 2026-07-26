import { useState } from "react";
import { Box, Paper, Alert } from "@mui/material";

// Subcomponentes
import ProductGrid from "@modules/cafeteria/components/grids/ProductGrid";
import CartTable from "@modules/cafeteria/components/tables/CartTable";
import PaymentSection from "@modules/cafeteria/components/PaymentSection";
import POSActions from "@modules/cafeteria/components/POSActions";
import { TicketModal } from "@modules/cafeteria/components/modals/TicketModal";
import { type Bill } from "@modules/cafeteria/types/Billing";

// Hooks y Controladores
import usePOSController from "@modules/cafeteria/controllers/usePOSController";
import useBillController from "@modules/cafeteria/controllers/useBillController";
import { useProducts } from "@modules/cafeteria/hooks/useProductApi";

export default function POSPage() {
  const [amountTendered, setAmountTendered] = useState<number>(0);

  // Estado para controlar la factura generada y la apertura del modal
  const [createdBill, setCreatedBill] = useState<Bill | null>(null);
  const [isTicketOpen, setIsTicketOpen] = useState<boolean>(false);

  // Controladores
  const posController = usePOSController();
  const billController = useBillController();

  // Consumo de datos reales desde el Backend
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();

  const handleExecuteCheckout = () => {
    const billData = posController.prepareBillData();
    
    billController.handleFormSubmit(billData, {
      onSuccess: (response: any) => {
        const bill = response?.data || response;
        
        setCreatedBill(bill);
        setIsTicketOpen(true);

        // Limpieza de estados
        posController.clearCart();
        setAmountTendered(0);
      },
    });
  };

  const handleCloseTicketModal = () => {
    setIsTicketOpen(false);
    setCreatedBill(null);
  };

  return (
    <Box 
      sx={{ 
        width: "100%", 
        minHeight: "100vh", 
        bgcolor: "#f8fafc", 
        p: { xs: 2, md: 3 },
        boxSizing: "border-box"
      }}
    >
      {/* Alerta de Error */}
      {billController.actionError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {billController.actionError}
        </Alert>
      )}

      {/* LAYOUT PRINCIPAL (Flexbox para evitar que se encoja cuando la tabla esté vacía) */}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", md: "row" }, 
          gap: 3, 
          width: "100%" 
        }}
      >
        {/* COLUMNA IZQUIERDA: Catálogo + Tabla del Carrito (Ocupa el ~65% permanente) */}
        <Box 
          sx={{ 
            flex: { xs: "1 1 100%", md: "1 1 65%" }, 
            display: "flex", 
            flexDirection: "column", 
            gap: 3,
            minWidth: 0 // Evita desbordamiento flex
          }}
        >
          {/* Cuadrícula Visual de Productos */}
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              border: "1px solid #e2e8f0", 
              bgcolor: "white", 
              width: "100%",
              boxSizing: "border-box"
            }}
          >
            <ProductGrid
              products={products}
              isLoading={isLoadingProducts}
              onSelectProduct={posController.addCartItem}
            />
          </Paper>

          {/* Tabla del Carrito o Estado Vacío */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              border: "1px solid #e2e8f0", 
              bgcolor: "white", 
              width: "100%",
              boxSizing: "border-box"
            }}
          >
            <CartTable
              items={posController.cartItems}
              onUpdateQuantity={posController.updateItemQuantity}
              onRemoveItem={posController.removeCartItem}
              onClearCart={posController.clearCart}
            />
          </Paper>
        </Box>

        {/* COLUMNA DERECHA: Pago y Acciones (Ocupa el ~35% permanente) */}
        <Box 
          sx={{ 
            flex: { xs: "1 1 100%", md: "0 0 35%", lg: "0 0 32%" }, 
            display: "flex", 
            flexDirection: "column", 
            gap: 3,
            minWidth: 280
          }}
        >
          <Box sx={{ position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Sección del Método de Pago */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2.5, 
                borderRadius: 3, 
                border: "1px solid #e2e8f0", 
                bgcolor: "white", 
                width: "100%",
                boxSizing: "border-box" 
              }}
            >
              <PaymentSection
                payMethod={posController.payMethod}
                onChangePayMethod={posController.setPayMethod}
                amountTendered={amountTendered}
                onChangeAmountTendered={setAmountTendered}
                cartTotal={posController.cartTotal}
              />
            </Paper>

            {/* Panel de Acciones de Cobro */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2.5, 
                borderRadius: 3, 
                border: "1px solid #e2e8f0", 
                bgcolor: "white", 
                width: "100%",
                boxSizing: "border-box" 
              }}
            >
              <POSActions
                total={posController.cartTotal}
                onSave={handleExecuteCheckout}
                isLoading={billController.isActionPending}
                heldOrders={posController.heldOrders}
                onHoldOrder={posController.holdCurrentOrder}
                onRestoreOrder={posController.restoreHeldOrder}
                onDeleteHeldOrder={posController.deleteHeldOrder}
                hasCartItems={posController.cartItems.length > 0}
              />
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Modal del Ticket */}
      <TicketModal
        isOpen={isTicketOpen}
        bill={createdBill}
        onClose={handleCloseTicketModal}
      />
    </Box>
  );
}