import { z } from 'zod';
import { BillDetailCreationSchema } from './bill-detail.schema.js';

// ----------------------------------------------------------------------
// 1. DEFINICIÓN DE CONSTANTES (Single Source of Truth)
// ----------------------------------------------------------------------
export const PAYMENT_METHODS = [
  "Efectivo",
  "Tarjeta",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// ----------------------------------------------------------------------
// 1. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseBillSchema = z.object({
    id: z.number().int().positive().optional(),

    date: z.date(),

    amount: z.number().positive(),

    pay_method: z.enum(PAYMENT_METHODS, {
    message: "El método de pago es obligatorio",
    }),
});

// ----------------------------------------------------------------------
// 2. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const BillCreationSchema = z.object({
    pay_method: BaseBillSchema.shape.pay_method,
    details: z.array(BillDetailCreationSchema).min(1, "El pedido no puede estar vacío")
});

// ----------------------------------------------------------------------
// 3. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const BillUpdateSchema = BaseBillSchema.partial();

// ----------------------------------------------------------------------
// 4. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type BillCreationDTO = z.infer<typeof BillCreationSchema>;
export type BillUpdateDTO = z.infer<typeof BillUpdateSchema>;

// Para UI
export type BillType = z.infer<typeof BaseBillSchema>;