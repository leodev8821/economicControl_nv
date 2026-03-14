import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN DE CONSTANTES (Single Source of Truth)
// ----------------------------------------------------------------------
export const CALL_OBSERVATIONS = [
  "Interesado",
  "No contesta",
  "Número no existe",
  "No interesado",
  "Vive fuera",
  "Otro",
] as const;
export type CallObservationType = (typeof CALL_OBSERVATIONS)[number];

export const HOW_KNOW_US = [
  "Amigo/Familiar",
  "Internet",
  "Redes Sociales",
  "Otro",
] as const;
export type HowKnowUsType = (typeof HOW_KNOW_US)[number];

// ----------------------------------------------------------------------
// 2. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseConsolidationSchema = z.object({
  id: z.coerce
    .number()
    .int({
      message: "El ID del registro es obligatorio",
    })
    .positive("El ID del registro debe ser un número entero positivo"),

  user_id: z.coerce
    .number()
    .int({
      message: "El ID del usuario es obligatorio",
    })
    .positive("El ID del usuario debe ser un número entero positivo"),

  member_id: z.coerce
    .number()
    .int({
      message: "El ID del miembro es obligatorio",
    })
    .positive("El ID del miembro debe ser un número entero positivo"),

  network_id: z.coerce
    .number()
    .int({
      message: "El ID de la red es obligatorio",
    })
    .positive("El ID de la red debe ser un número entero positivo")
    .nullable(),

  how_know_us: z
    .enum(HOW_KNOW_US, {
      message: "La forma de conocernos es obligatoria",
    })
    .nullable(),

  invited_by: z
    .string({
      message: "El nombre de quien ha invitado es obligatorio",
    })
    .optional()
    .nullable(),

  call_date: z.coerce
    .date({
      error: "La fecha de la llamada es inválida",
    })
    .nullable()
    .optional(),

  call_observations: z
    .enum(CALL_OBSERVATIONS, {
      message: "La observación de la llamada es obligatoria",
    })
    .nullable()
    .optional(),

  other_observations: z.string().optional().nullable(),

  visit_date: z.coerce
    .date({
      error: "La fecha de la visita es inválida",
    })
    .nullable()
    .optional(),

  visit_observations: z
    .string()
    .min(1, "Si escribes algo, no puede estar vacío")
    .nullable()
    .optional(),

  is_visible: z
    .boolean({
      message: "La visibilidad es obligatoria",
    })
    .default(true),
});

// ----------------------------------------------------------------------
// 3. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const ConsolidationCreationSchema = BaseConsolidationSchema.omit({
  id: true,
});

// ----------------------------------------------------------------------
// 4. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const ConsolidationUpdateSchema = BaseConsolidationSchema.omit({
  id: true,
}).partial();

// ----------------------------------------------------------------------
// 5. ESQUEMA DE CARGA MASIVA
// ----------------------------------------------------------------------
export const BulkConsolidationItemSchema = BaseConsolidationSchema.omit({
  id: true,
});

export const BulkConsolidationSchema = z.object({
  consolidations: z
    .array(BulkConsolidationItemSchema)
    .min(1, "Debe agregar al menos una consolidación"),
});

// ----------------------------------------------------------------------
// 6. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type ConsolidationCreationDTO = z.infer<
  typeof ConsolidationCreationSchema
>;
export type ConsolidationUpdateDTO = z.infer<typeof ConsolidationUpdateSchema>;
export type BulkConsolidationCreationDTO = z.infer<
  typeof BulkConsolidationItemSchema
>;
export type ConsolidationBulkCreateDTO = z.infer<
  typeof BulkConsolidationSchema
>;

// Para la UI
export type ConsolidationType = z.infer<typeof BaseConsolidationSchema>;
