import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN DE CONSTANTES (Single Source of Truth)
// ----------------------------------------------------------------------
export const STATUS = [
  "Soltero/a",
  "Casado/a",
  "Divorciado/a",
  "Viudo/a",
] as const;
export type StatusType = (typeof STATUS)[number];

export const GENDER = ["Masculino", "Femenino"] as const;
export type GenderType = (typeof GENDER)[number];

// ----------------------------------------------------------------------
// 2. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseMemberSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
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
  is_visible: z.boolean().default(true).optional(),
});

// ----------------------------------------------------------------------
// 3. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const MemberCreationSchema = BaseMemberSchema;

// ----------------------------------------------------------------------
// 4. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const MemberUpdateSchema = BaseMemberSchema.partial();

// ----------------------------------------------------------------------
// 5. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type MemberCreationRequest = z.infer<typeof MemberCreationSchema>;
export type MemberUpdateRequest = z.infer<typeof MemberUpdateSchema>;

// ----------------------------------------------------------------------
// 6. ESQUEMA para Carga Masiva (Formulario)
// ----------------------------------------------------------------------

// 1. Definimos el item del Bulk con la validación de "Diezmo"
export const BulkMemberItemSchema = BaseMemberSchema;

// 2. El Schema del formulario ahora usará el item refinado
export const BulkMemberSchema = z.object({
  members: z
    .array(BulkMemberItemSchema)
    .min(1, "Debe agregar al menos una persona"),
});

export type BulkMemberItemRequest = z.infer<typeof BulkMemberItemSchema>;
export type BulkMemberRequest = z.infer<typeof BulkMemberSchema>;

// Para la UI
export type MemberType = z.infer<typeof BaseMemberSchema>;
