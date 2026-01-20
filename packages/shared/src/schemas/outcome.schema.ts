import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN DE CONSTANTES (Single Source of Truth)
// ----------------------------------------------------------------------
export const OUTCOME_CATEGORIES = ["Fijos", "Variables", "Otro"] as const;
export type OutcomeCategories = (typeof OUTCOME_CATEGORIES)[number];

// ----------------------------------------------------------------------
// 2. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseOutcomeSchema = z.object({
  cash_id: z.coerce
    .number()
    .int({
      message: "El ID de la caja es obligatorio",
    })
    .positive("El ID de la caja debe ser un número entero positivo"),

  week_id: z.coerce
    .number()
    .int({
      message: "El ID de la semana es obligatorio",
    })
    .positive("El ID de la semana debe ser un número entero positivo"),

  date: z
    .string({
      message: "La fecha es obligatoria",
    })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "El formato de fecha es inválido (debe ser AAAA-MM-DD)",
    ),

  amount: z.coerce
    .number({
      message: "El monto es obligatorio",
    })
    .positive("El monto debe ser un valor positivo")
    .refine((v) => Math.round(v * 100) === v * 100, {
      message: "El monto solo puede tener dos decimales",
    }),

  description: z
    .string({
      message: "La descripción es obligatoria",
    })
    .min(1, "La descripción no puede estar vacía"),

  category: z.enum(OUTCOME_CATEGORIES, {
    message: "La categoría de egreso es obligatoria",
  }),
});

// ----------------------------------------------------------------------
// 3. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const OutcomeCreationSchema = BaseOutcomeSchema;

// ----------------------------------------------------------------------
// 4. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const OutcomeUpdateSchema = BaseOutcomeSchema.partial();

// ----------------------------------------------------------------------
// 5. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type OutcomeCreationRequest = z.infer<typeof OutcomeCreationSchema>;
export type OutcomeUpdateRequest = z.infer<typeof OutcomeUpdateSchema>;

// ----------------------------------------------------------------------
// 6. ESQUEMA para Carga Masiva (Formulario)
// ----------------------------------------------------------------------

// 1. Definimos el item del Bulk con la validación de "Diezmo"
export const BulkOutcomeItemSchema = BaseOutcomeSchema.omit({
  week_id: true,
});

// 2. El Schema del formulario ahora usará el item refinado
export const BulkOutcomeSchema = z.object({
  common_week_id: z.coerce
    .number({ message: "Debe seleccionar una semana" })
    .int()
    .positive(),
  outcomes: z
    .array(BulkOutcomeItemSchema)
    .min(1, "Debe agregar al menos un egreso"),
});

export type BulkOutcomeItemRequest = z.infer<typeof BulkOutcomeItemSchema>;
export type BulkOutcomeRequest = z.infer<typeof BulkOutcomeSchema>;

// Para la UI
export type OutcomeType = z.infer<typeof BaseOutcomeSchema>;
