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
const BasePersonRegisterSchema = z.object({
  first_name: z.string().min(1, "El nombre es obligatorio").max(50),
  last_name: z.string().min(1, "El apellido es obligatorio").max(50),
  phone: z.string().min(1, "El teléfono es obligatorio").max(15),
  gender: z.string().min(1, "El género es obligatorio").max(1),
  birth_date: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria")
    .max(10),
  is_visible: z.boolean().default(true).optional(),
});

// ----------------------------------------------------------------------
// 3. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const PersonRegisterCreationSchema = BasePersonRegisterSchema;

// ----------------------------------------------------------------------
// 4. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const PersonRegisterUpdateSchema = BasePersonRegisterSchema.partial();

// ----------------------------------------------------------------------
// 5. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type PersonRegisterCreationRequest = z.infer<
  typeof PersonRegisterCreationSchema
>;
export type PersonRegisterUpdateRequest = z.infer<
  typeof PersonRegisterUpdateSchema
>;

// ----------------------------------------------------------------------
// 6. ESQUEMA para Carga Masiva (Formulario)
// ----------------------------------------------------------------------

// 1. Definimos el item del Bulk con la validación de "Diezmo"
export const BulkPersonRegisterItemSchema = BasePersonRegisterSchema;

// 2. El Schema del formulario ahora usará el item refinado
export const BulkPersonRegisterSchema = z.object({
  persons: z
    .array(BulkPersonRegisterItemSchema)
    .min(1, "Debe agregar al menos una persona"),
});

export type BulkPersonRegisterItemRequest = z.infer<
  typeof BulkPersonRegisterItemSchema
>;
export type BulkPersonRegisterRequest = z.infer<
  typeof BulkPersonRegisterSchema
>;

// Para la UI
export type PersonRegisterType = z.infer<typeof BasePersonRegisterSchema>;
