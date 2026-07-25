import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseBillDetailSchema = z.object({
    id: z.number().int().positive().optional(),

    bill_id: z.number().int().positive(),

    product_id: z.coerce.number().int().positive('product_id debe ser un entero positivo'),

    quantity: z.coerce.number().positive(),

    unit_price: z.number().positive(),

    subtotal: z.number().positive(),
});

// ----------------------------------------------------------------------
// 2. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const BillDetailCreationSchema = BaseBillDetailSchema.pick({
    product_id: true,
    quantity: true,
});

// ----------------------------------------------------------------------
// 3. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const BillDetailUpdateSchema = BaseBillDetailSchema.partial();

// ----------------------------------------------------------------------
// 4. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type BillDetailCreationDTO = z.infer<typeof BillDetailCreationSchema>;
export type BillDetailUpdateDTO = z.infer<typeof BillDetailUpdateSchema>;

// Para UI
export type BillDetailType = z.infer<typeof BaseBillDetailSchema>;





    