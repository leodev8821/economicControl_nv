import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BasePersonSchema = z.object({
  id: z.number().int().positive().optional(),

  first_name: z.string().min(1, "El nombre es obligatorio"),
  last_name: z.string().min(1, "El apellido es obligatorio"),

  dni: z
    .string({ message: "El DNI es obligatorio" })
    .min(1, "El DNI no puede estar vacío")
    .max(9, "El DNI no puede tener más de 9 caracteres"),

  isVisible: z.boolean().default(true).optional(),
});

// ----------------------------------------------------------------------
// 2. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const PersonCreationSchema = BasePersonSchema;

// ----------------------------------------------------------------------
// 3. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const PersonUpdateSchema = BasePersonSchema.partial();

// ----------------------------------------------------------------------
// 4. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type PersonCreationRequest = z.infer<typeof PersonCreationSchema>;
export type PersonUpdateRequest = z.infer<typeof PersonUpdateSchema>;

// Para UI
export type PersonType = z.infer<typeof BasePersonSchema>;
