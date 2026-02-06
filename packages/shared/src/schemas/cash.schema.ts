import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseCashSchema = z.object({
  id: z.number().int().positive().optional(),

  name: z.string().min(1, "El nombre no puede estar vacío"),

  actual_amount: z.coerce
    .number({ message: "El monto es obligatorio" })
    .refine((v) => Math.round(v * 100) === v * 100, {
      message: "El monto solo puede tener dos decimales",
    }),
});

// ----------------------------------------------------------------------
// 2. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const CashCreationSchema = BaseCashSchema;

// ----------------------------------------------------------------------
// 3. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const CashUpdateSchema = BaseCashSchema.partial();

// ----------------------------------------------------------------------
// 4. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type CashCreationRequest = z.infer<typeof CashCreationSchema>;
export type CashUpdateRequest = z.infer<typeof CashUpdateSchema>;

// Para UI
export type CashType = z.infer<typeof BaseCashSchema>;
