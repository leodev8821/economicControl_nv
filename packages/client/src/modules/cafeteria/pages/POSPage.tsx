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
  const [createdBill, setCreatedBill] = useState<Bill | null>(null);
  const [isTicketOpen, setIsTicketOpen] = useState<boolean>(false);

  const posController = usePOSController();
  const billController = useBillController();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();

  const handleExecuteCheckout = () => {
    const billData = posController.prepareBillData();
    
    billController.handleFormSubmit(billData, {
      onSuccess: (response: any) => {
        const bill = response?.data || response;
        
        setCreatedBill(bill);
        setIsTicketOpen(true);
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
        height: { xs: "auto", md: "calc(100vh - 100px)" },
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box"
      }}
    >
      {billController.actionError && (
        <Alert severity="error" sx={{ mb: 2, flexShrink: 0, borderRadius: 2 }}>
          {billController.actionError}
        </Alert>
      )}

      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", md: "row" }, 
          gap: 3, 
          flexGrow: 1, 
          minHeight: 0 
        }}
      >
        {/* ==========================================
            COLUMNA IZQUIERDA: 70% (Catálogo + Carrito)
            ========================================== */}
        <Box 
          sx={{ 
            // Aumentamos el ancho al 70%
            flex: { xs: "1 1 100%", md: "1 1 70%" }, 
            display: "flex", 
            flexDirection: "column", 
            gap: 2,
            minWidth: 0, 
            height: "100%"
          }}
        >
          {/* SECCIÓN ARRIBA: Cuadrícula Visual de Productos (Altura expansible) */}
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              border: "1px solid #e2e8f0", 
              bgcolor: "white",
              flexGrow: 1, // Ahora toma TODO el espacio vertical que sobre
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minHeight: 0 // Vital para que el scroll interno no se rompa
            }}
          >
            <Box sx={{ overflowY: "auto", p: 2, height: "100%" }}>
              <ProductGrid
                products={products}
                isLoading={isLoadingProducts}
                onSelectProduct={posController.addCartItem}
              />
            </Box>
          </Paper>

          {/* SECCIÓN ABAJO: Tabla del Carrito (Altura dinámica) */}
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              border: "1px solid #e2e8f0", 
              bgcolor: "white", 
              flexShrink: 0, // No se aplasta más allá del contenido que tenga
              // Crece según su contenido, pero se detiene al alcanzar el 45% de la pantalla
              maxHeight: { xs: "none", md: "45%" }, 
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            <Box sx={{ overflowY: "auto", p: 2, height: "100%" }}>
              <CartTable
                items={posController.cartItems}
                onUpdateQuantity={posController.updateItemQuantity}
                onRemoveItem={posController.removeCartItem}
                onClearCart={posController.clearCart}
              />
            </Box>
          </Paper>
        </Box>

        {/* ==========================================
            COLUMNA DERECHA: 30% (Pagos y Acciones)
            ========================================== */}
        <Box 
          sx={{ 
            flex: { xs: "1 1 100%", md: "0 0 30%" }, 
            minWidth: 320, // Evita que se colapse demasiado
            display: "flex", 
            flexDirection: "column", 
            gap: 2,
            height: "100%",
            overflowY: "auto" 
          }}
        >
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2.5, 
              borderRadius: 3, 
              border: "1px solid #e2e8f0", 
              bgcolor: "white", 
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

          <Paper 
            elevation={0} 
            sx={{ 
              p: 2.5, 
              borderRadius: 3, 
              border: "1px solid #e2e8f0", 
              bgcolor: "white", 
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

      {/* Modal del Ticket */}
      <TicketModal
        isOpen={isTicketOpen}
        bill={createdBill}
        onClose={handleCloseTicketModal}
      />
    </Box>
  );
}