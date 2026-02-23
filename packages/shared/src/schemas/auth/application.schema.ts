import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN DE CONSTANTES (Single Source of Truth)
// ----------------------------------------------------------------------
export const APPLICATION_TYPES = {
  ALL: "Todas",
  FINANCE: "Finanzas",
  CONSOLIDATION: "Consolidación",
} as const;

export const APPLICATION_VALUES = Object.values(APPLICATION_TYPES) as [
  string,
  ...string[],
];

export const APPLICATION_DESCRIPTIONS = {
  ALL: "Todas las aplicaciones",
  FINANCE: "Sistema de control financiero",
  CONSOLIDATION: "Sistema de consolidación de miembros",
} as const;

export const APPLICATION_DESCRIPTIONS_VALUES = Object.values(
  APPLICATION_DESCRIPTIONS,
) as [string, ...string[]];

export const APPLICATION_ROUTES = {
  FINANCE: "/finance",
  CONSOLIDATION: "/consolidation",
} as const;

export const APPLICATION_ROUTES_VALUES = Object.values(APPLICATION_ROUTES) as [
  string,
  ...string[],
];

// ----------------------------------------------------------------------
// 2. DEFINICIÓN DE BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseApplicationSchema = z.object({
  id: z.number().int().positive().optional(),
  app_name: z.enum(APPLICATION_VALUES, {
    message: "El tipo de aplicación es obligatorio",
  }),
  description: z.enum(APPLICATION_DESCRIPTIONS_VALUES, {
    message: "La descripción es obligatoria",
  }),
});

// ----------------------------------------------------------------------
// 3. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const ApplicationCreationSchema = BaseApplicationSchema;

// ----------------------------------------------------------------------
// 4. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const ApplicationUpdateSchema = BaseApplicationSchema.partial();

// ----------------------------------------------------------------------
// 5. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type ApplicationCreationRequest = z.infer<
  typeof ApplicationCreationSchema
>;
export type ApplicationUpdateRequest = z.infer<typeof ApplicationUpdateSchema>;

// Para la UI
export type ApplicationType = z.infer<typeof BaseApplicationSchema>;
