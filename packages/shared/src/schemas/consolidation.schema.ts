import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN DE CONSTANTES (Single Source of Truth)
// ----------------------------------------------------------------------
export const CLASIFICATION = [
  "No contesta",
  "No interesado",
  "Otra ciudad",
  "Real",
] as const;
export type ClasificationType = (typeof CLASIFICATION)[number];

// ----------------------------------------------------------------------
// 2. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseConsolidationSchema = z.object({
  register_id: z.coerce
    .number()
    .int({
      message: "El ID del registro es obligatorio",
    })
    .positive("El ID del registro debe ser un número entero positivo"),

  lider_id: z.coerce
    .number()
    .int({
      message: "El ID del líder es obligatorio",
    })
    .positive("El ID del líder debe ser un número entero positivo"),

  red_id: z.coerce
    .number()
    .int({
      message: "El ID de la red es obligatorio",
    })
    .positive("El ID de la red debe ser un número entero positivo"),

  church_visit_date: z
    .string({
      message: "La fecha de visita es obligatoria",
    })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "El formato de fecha es inválido (debe ser AAAA-MM-DD)",
    ),

  call_date: z
    .string({
      message: "La fecha de la llamada es obligatoria",
    })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "El formato de fecha es inválido (debe ser AAAA-MM-DD)",
    ),

  visit_date: z
    .string({
      message: "La fecha de la visita es obligatoria",
    })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "El formato de fecha es inválido (debe ser AAAA-MM-DD)",
    ),

  /*   observations: z
    .string({
      message: "La observación es obligatoria",
    })
    .min(1, "La observación no puede estar vacía"),

  invited_by: z
    .string({
      message: "La persona que invita es obligatoria",
    })
    .min(1, "La persona que invita no puede estar vacía"), */

  clasification: z.enum(CLASIFICATION, {
    message: "La clasificación es obligatoria",
  }),
});

// ----------------------------------------------------------------------
// 3. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const ConsolidationCreationSchema = BaseConsolidationSchema;

// ----------------------------------------------------------------------
// 4. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const ConsolidationUpdateSchema = BaseConsolidationSchema.partial();

// ----------------------------------------------------------------------
// 5. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type ConsolidationCreationRequest = z.infer<
  typeof ConsolidationCreationSchema
>;
export type ConsolidationUpdateRequest = z.infer<
  typeof ConsolidationUpdateSchema
>;

// ----------------------------------------------------------------------
// 6. ESQUEMA para Carga Masiva (Formulario)
// ----------------------------------------------------------------------

// 1. Definimos el item del Bulk con la validación de "Diezmo"
export const BulkConsolidationItemSchema = BaseConsolidationSchema;

// 2. El Schema del formulario ahora usará el item refinado
export const BulkConsolidationSchema = z.object({
  clasifications: z
    .array(BulkConsolidationItemSchema)
    .min(1, "Debe agregar al menos una clasificación"),
});

export type BulkConsolidationItemRequest = z.infer<
  typeof BulkConsolidationItemSchema
>;
export type BulkConsolidationRequest = z.infer<typeof BulkConsolidationSchema>;

// Para la UI
export type ConsolidationType = z.infer<typeof BaseConsolidationSchema>;
