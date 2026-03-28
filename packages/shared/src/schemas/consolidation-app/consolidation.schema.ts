import { z } from "zod";
import type { HowKnowUsType } from "./member.schema.js";

// ----------------------------------------------------------------------
// DEFINICIÓN DE CONSTANTES (Single Source of Truth)
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

// ----------------------------------------------------------------------
// DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseConsolidationSchema = z.object({
  id: z.coerce
    .number()
    .int({
      message: "El ID del registro es obligatorio",
    })
    .positive("El ID del registro debe ser un número entero positivo"),

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
// ESQUEMA de Creación
// ----------------------------------------------------------------------
export const ConsolidationCreationSchema = BaseConsolidationSchema.omit({
  id: true,
});

// ----------------------------------------------------------------------
// ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const ConsolidationUpdateSchema = BaseConsolidationSchema.omit({
  id: true,
}).partial();

// ----------------------------------------------------------------------
// ESQUEMA DE CARGA MASIVA
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
// EXPORTACIÓN DE TIPOS E INTERFACES
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

// 🔹 Tipos mínimos de relaciones (solo lo que devuelve el scope)
export type ConsolidationUser = {
  id: number;
  username: string;
};

export type ConsolidationMember = {
  id: number;
  first_name: string;
  last_name: string;
  user_id: number | null;
  User: ConsolidationUser;
  gender: string;
  phone?: string | null;
  birth_date?: Date | string | null;
  status?: string | null;
  visit_date?: Date | null;
  how_know_us?: HowKnowUsType | null;
  invited_by?: string | null;
};

export type ConsolidationNetwork = {
  id: number;
  name: string;
};

// Para la UI
export type ConsolidationType = z.infer<typeof BaseConsolidationSchema>;

export type ConsolidationPopulatedType = ConsolidationType & {
  Member: ConsolidationMember;
  Network: ConsolidationNetwork | null;
};
