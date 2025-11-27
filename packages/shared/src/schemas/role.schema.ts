import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN DE CONSTANTES (Single Source of Truth)
// ----------------------------------------------------------------------
export const ROLE_TYPES = {
  ADMINISTRADOR: "Administrador",
  SUPER_USER: "SuperUser",
  USUARIO: "Usuario",
} as const;

export const ROLE_VALUES = Object.values(ROLE_TYPES) as [string, ...string[]];

// ----------------------------------------------------------------------
// 2. DEFINICIÓN DE BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseRoleSchema = z.object({
  id: z.number().int().positive().optional(),

  source: z.enum(ROLE_VALUES, {
    message: "El tipo de rol es obligatorio",
  }),
});

// ----------------------------------------------------------------------
// 3. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const RoleCreationSchema = BaseRoleSchema;

// ----------------------------------------------------------------------
// 4. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const RoleUpdateSchema = BaseRoleSchema.partial();

// ----------------------------------------------------------------------
// 5. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type RoleCreationRequest = z.infer<typeof RoleCreationSchema>;
export type RoleUpdateRequest = z.infer<typeof RoleUpdateSchema>;

// Para la UI
export type RoleType = z.infer<typeof BaseRoleSchema>;
