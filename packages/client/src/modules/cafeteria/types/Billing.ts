// Configuración de impresión
export interface PrintConfig {
  nombre_negocio: string;
  ancho_papel: number; // Ej: 80 o 58 (mm)
  font_size: number;
  factura_auto_print: boolean;
  factura_imprime_servidor: boolean;
}

// Detalle del ticket con el producto populado
export interface BillDetail {
  id?: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  Product?: {
    code: string;
    name: string;
  };
}

// Objeto completo de la factura/ticket
export interface Bill {
  id: number;
  amount: number;
  pay_method: string;
  date: string;
  Details: BillDetail[];
}

// DTO para enviar al endpoint POST /bills
export interface BillCreationPayload {
  pay_method: string;
  details: {
    product_id: number;
    quantity: number;
  }[];
}