import { z } from "zod";

// ----------------------------------------------------------------------
// DEFINICIÓN DE CONSTANTES (Single Source of Truth)
// ----------------------------------------------------------------------
export const STATUS = [
  "Soltero/a",
  "Casado/a",
  "Unión Libre",
  "Divorciado/a",
  "Viudo/a",
] as const;
export type StatusType = (typeof STATUS)[number];

export const GENDER = ["Masculino", "Femenino"] as const;
export type GenderType = (typeof GENDER)[number];

export const HOW_KNOW_US = [
  "Amigo/Familiar",
  "Internet",
  "Redes Sociales",
  "Otro",
] as const;
export type HowKnowUsType = (typeof HOW_KNOW_US)[number];
// ----------------------------------------------------------------------
// DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseMemberSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  user_id: z.coerce.number().int().positive().optional(),
  first_name: z.string({ message: "El nombre es obligatorio" }).min(1).max(50),
  last_name: z.string({ message: "El apellido es obligatorio" }).min(1).max(50),
  phone: z.string({ message: "El teléfono es obligatorio" }).min(1).max(15),
  gender: z.enum(GENDER, {
    message: "El género es obligatorio",
  }),
  birth_date: z
    .string({ message: "La fecha de nacimiento es obligatoria" })
    .min(1)
    .max(10),
  status: z.enum(STATUS, {
    message: "El estado civil no es válido",
  }),
  visit_date: z
    .string({ message: "La fecha de visita es obligatoria" })
    .min(1)
    .max(10),
  is_visible: z.boolean().default(true).optional(),
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
    .nullable()
    .or(z.literal("")),
});

// ----------------------------------------------------------------------
// ESQUEMA de Creación
// ----------------------------------------------------------------------
export const MemberCreationSchema = BaseMemberSchema.omit({ id: true });

// ----------------------------------------------------------------------
// ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const MemberUpdateSchema = BaseMemberSchema.omit({ id: true }).partial();

// ----------------------------------------------------------------------
// ESQUEMA para Carga Masiva (Formulario)
// ----------------------------------------------------------------------

// Se define el item del Bulk
export const BulkMemberItemSchema = BaseMemberSchema.omit({ id: true });

// El Schema del formulario ahora usará el item refinado
export const BulkMemberSchema = z.object({
  members: z
    .array(BulkMemberItemSchema)
    .min(1, "Debe agregar al menos una persona"),
});

// ----------------------------------------------------------------------
// EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type MemberCreateDTO = z.infer<typeof MemberCreationSchema>;
export type MemberUpdateDTO = z.infer<typeof MemberUpdateSchema>;
export type BulkMemberCreateDTO = z.infer<typeof BulkMemberItemSchema>;
export type BulkMemberDTO = z.infer<typeof BulkMemberSchema>;

// Para la UI
export type MemberType = z.infer<typeof BaseMemberSchema>;
