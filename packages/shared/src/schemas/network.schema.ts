import { z } from "zod";

// ----------------------------------------------------------------------
// . DEFINICIÓN DE BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseNetworkSchema = z.object({
  id: z.number().int().positive().optional(),

  name: z.string().min(1, "El nombre es obligatorio"),
  is_visible: z.boolean().default(true),
});

// ----------------------------------------------------------------------
// 3. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const NetworkCreationSchema = BaseNetworkSchema;

// ----------------------------------------------------------------------
// 4. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const NetworkUpdateSchema = BaseNetworkSchema.partial();

// ----------------------------------------------------------------------
// 5. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type NetworkCreationRequest = z.infer<typeof NetworkCreationSchema>;
export type NetworkUpdateRequest = z.infer<typeof NetworkUpdateSchema>;

// Para la UI
export type NetworkType = z.infer<typeof BaseNetworkSchema>;
