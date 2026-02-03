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

// ----------------------------------------------------------------------
// 2. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseMemberRegisterSchema = z.object({
  first_name: z.string().min(1, "El nombre es obligatorio").max(50),
  last_name: z.string().min(1, "El apellido es obligatorio").max(50),
  phone: z.string().min(1, "El teléfono es obligatorio").max(15),
  gender: z.string().min(1, "El género es obligatorio").max(1),
  birth_date: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria")
    .max(10),
  status: z.enum(STATUS, {
    message: "El estado civil no es válido",
  }),
  is_visible: z.boolean().default(true).optional(),
});

// ----------------------------------------------------------------------
// 3. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const MemberRegisterCreationSchema = BaseMemberRegisterSchema;

// ----------------------------------------------------------------------
// 4. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const MemberRegisterUpdateSchema = BaseMemberRegisterSchema.partial();

// ----------------------------------------------------------------------
// 5. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type MemberRegisterCreationRequest = z.infer<
  typeof MemberRegisterCreationSchema
>;
export type MemberRegisterUpdateRequest = z.infer<
  typeof MemberRegisterUpdateSchema
>;

// ----------------------------------------------------------------------
// 6. ESQUEMA para Carga Masiva (Formulario)
// ----------------------------------------------------------------------

// 1. Definimos el item del Bulk con la validación de "Diezmo"
export const BulkMemberRegisterItemSchema = BaseMemberRegisterSchema;

// 2. El Schema del formulario ahora usará el item refinado
export const BulkMemberRegisterSchema = z.object({
  members: z
    .array(BulkMemberRegisterItemSchema)
    .min(1, "Debe agregar al menos una persona"),
});

export type BulkMemberRegisterItemRequest = z.infer<
  typeof BulkMemberRegisterItemSchema
>;
export type BulkMemberRegisterRequest = z.infer<
  typeof BulkMemberRegisterSchema
>;

// Para la UI
export type MemberRegisterType = z.infer<typeof BaseMemberRegisterSchema>;
