import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseReportSchema = z.object({
  id: z.number().int().positive().optional(),

  week_id: z.coerce
    .number()
    .int()
    .positive("El ID de la semana debe ser válido"),

  total_income: z.coerce
    .number()
    .positive()
    .refine((v) => Math.round(v * 100) === v * 100, "Máximo dos decimales"),

  total_outcome: z.coerce
    .number()
    .positive()
    .refine((v) => Math.round(v * 100) === v * 100, "Máximo dos decimales"),

  // net_balance suele ser calculado, pero si se guarda/envía, lo validamos igual
  net_balance: z.coerce
    .number()
    .refine((v) => Math.round(v * 100) === v * 100, "Máximo dos decimales"),
});

// ----------------------------------------------------------------------
// 2. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const ReportCreationSchema = BaseReportSchema;

// ----------------------------------------------------------------------
// 3. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const ReportUpdateSchema = BaseReportSchema.partial();

// ----------------------------------------------------------------------
// 4. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type ReportCreationRequest = z.infer<typeof ReportCreationSchema>;
export type ReportUpdateRequest = z.infer<typeof ReportUpdateSchema>;

// Para UI
export type ReportType = z.infer<typeof BaseReportSchema>;
