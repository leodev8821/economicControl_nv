import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseCashDenominationSchema = z.object({
  id: z.number().int().positive().optional(),

  denomination_value: z.string().min(1, "El valor no puede estar vacío"),

  quantity: z.coerce
    .number({ message: "La cantidad es obligatoria" })
    .refine((v) => Math.round(v * 100) === v * 100, {
      message: "La cantidad solo puede tener dos decimales",
    }),
});

// ----------------------------------------------------------------------
// 2. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const CashDenominationCreationSchema = BaseCashDenominationSchema;

// ----------------------------------------------------------------------
// 3. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const CashDenominationUpdateSchema =
  BaseCashDenominationSchema.partial();

// ----------------------------------------------------------------------
// 4. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type CashDenominationCreationRequest = z.infer<
  typeof CashDenominationCreationSchema
>;
export type CashDenominationUpdateRequest = z.infer<
  typeof CashDenominationUpdateSchema
>;

// Para UI
export type CashDenominationType = z.infer<typeof BaseCashDenominationSchema>;
