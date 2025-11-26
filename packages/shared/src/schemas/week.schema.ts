import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseWeekSchema = z.object({
  id: z.number().int().positive().optional(),

  week_start: z
    .string({ message: "La fecha de inicio es obligatoria" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido (AAAA-MM-DD)"),

  week_end: z
    .string({ message: "La fecha de fin es obligatoria" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido (AAAA-MM-DD)"),
});

// ----------------------------------------------------------------------
// 2. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const WeekCreationSchema = BaseWeekSchema;

// ----------------------------------------------------------------------
// 3. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const WeekUpdateSchema = BaseWeekSchema.partial();

// ----------------------------------------------------------------------
// 5. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type WeekCreationRequest = z.infer<typeof WeekCreationSchema>;
export type WeekUpdateRequest = z.infer<typeof WeekUpdateSchema>;

// Para UI
export type WeekType = z.infer<typeof BaseWeekSchema>;
