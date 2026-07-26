import { useState, useMemo, useEffect } from "react";
import type {
  ProductType,
  BillCreationDTO,
  PaymentMethod,
} from "@economic-control/shared";
import type { POSCartItem, HeldOrder } from "@modules/cafeteria/types/POSCartItem";

export default function usePOSController() {
  const [cartItems, setCartItems] = useState<POSCartItem[]>([]);
  const [payMethod, setPayMethod] = useState<PaymentMethod>("Efectivo");
  
  // Estado para los pedidos guardados/pausados (iniciamos intentando leer de localStorage)
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(() => {
    const saved = localStorage.getItem("pos_held_orders");
    if (!saved) return [];
    try {
      return JSON.parse(saved).map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
      }));
    } catch {
      return [];
    }
  });

  // Guardar en localStorage cada vez que cambien los pedidos en espera
  useEffect(() => {
    localStorage.setItem("pos_held_orders", JSON.stringify(heldOrders));
  }, [heldOrders]);

  const addCartItem = (product: ProductType) => {
  if (!product.id) return;

  const unitPrice = Number(product.unit_price || 0);

  setCartItems((prev) => {
    const existing = prev.find((item) => item.id === product.id);

    if (existing) {
      return prev.map((item) => {
        if (item.id === product.id) {
          const updatedQty = item.quantity + 1;
          return {
            ...item,
            unit_price: unitPrice,
            quantity: updatedQty,
            subtotal: updatedQty * unitPrice,
          };
        }
        return item;
      });
    }

    return [
      ...prev,
      {
        ...product,
        unit_price: unitPrice,
        quantity: 1,
        subtotal: unitPrice,
      },
    ];
  });
};

  const updateItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity, subtotal: quantity * item.unit_price }
          : item
      )
    );
  };

  const removeCartItem = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cartItems]);

  // --- LÓGICA DE PEDIDOS EN ESPERA / PAUSADOS ---

  // 1. Guardar el pedido actual
  const holdCurrentOrder = (note?: string) => {
    if (cartItems.length === 0) return;

    // Si 'note' no es una cadena de texto (por ejemplo, si vino un SyntheticEvent de React), usamos la nota por defecto
    const customNote = typeof note === "string" && note.trim().length > 0
      ? note
      : `Pedido #${heldOrders.length + 1}`;

    const newHeldOrder: HeldOrder = {
      id: `order_${Date.now()}`,
      items: cartItems,
      total: cartTotal,
      createdAt: new Date(),
      note: customNote,
    };

    setHeldOrders((prev) => [newHeldOrder, ...prev]);
    clearCart(); // Limpiamos la pantalla para el siguiente cliente
  };

  // 2. Recuperar un pedido guardado
  const restoreHeldOrder = (orderId: string) => {
    const orderToRestore = heldOrders.find((order) => order.id === orderId);
    if (!orderToRestore) return;

    // Cargamos los items del pedido guardado en el carrito
    setCartItems(orderToRestore.items);

    // Lo eliminamos de la lista de pedidos en espera
    deleteHeldOrder(orderId);
  };

  // 3. Eliminar un pedido guardado (si el cliente canceló)
  const deleteHeldOrder = (orderId: string) => {
    setHeldOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  const prepareBillData = (): BillCreationDTO => {
    return {
      pay_method: payMethod,
      details: cartItems.map((item) => ({
        product_id: item.id!,
        quantity: item.quantity,
      })),
    };
  };

  return {
    cartItems,
    addCartItem,
    updateItemQuantity,
    removeCartItem,
    clearCart,
    payMethod,
    setPayMethod,
    cartTotal,
    prepareBillData,
    heldOrders,
    holdCurrentOrder,
    restoreHeldOrder,
    deleteHeldOrder,
  };
}