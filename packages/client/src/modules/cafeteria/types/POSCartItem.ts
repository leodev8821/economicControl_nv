import type { ProductType } from "@economic-control/shared";

// Representa un renglón del carrito activo en la pantalla
export type POSCartItem = ProductType & {
  quantity: number; // Cantidad seleccionada
  subtotal: number; // unit_price * quantity
};

// Nueva estructura para pedidos guardados/pausados
export interface HeldOrder {
  id: string; // ID único (ej. timestamp)
  items: POSCartItem[];
  total: number;
  createdAt: Date;
  note?: string; // Opcional: ej. "Mesa 3", "Chico de la chaqueta azul", etc.
}