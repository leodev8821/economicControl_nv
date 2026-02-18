import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseCashDenominationSchema = z.object({
  id: z.number().int().positive().optional(),

  cash_id: z
    .number({ message: "El ID de la caja es obligatorio" })
    .int()
    .positive(),

  denomination_value: z
    .number({ message: "El valor es obligatorio" })
    .positive(),

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

// Schema para recibir datos del Body (sin cash_id porque viene por URL)
export const CashDenominationBodySchema = BaseCashDenominationSchema.omit({
  cash_id: true,
});

// ----------------------------------------------------------------------
// 3. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const CashDenominationUpdateSchema =
  BaseCashDenominationSchema.partial();

// ----------------------------------------------------------------------
// 4. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type CashDenominationCreationDTO = z.infer<
  typeof CashDenominationCreationSchema
>;
export type CashDenominationUpdateDTO = z.infer<
  typeof CashDenominationUpdateSchema
>;

// Para UI
export type CashDenominationType = z.infer<typeof BaseCashDenominationSchema>;
