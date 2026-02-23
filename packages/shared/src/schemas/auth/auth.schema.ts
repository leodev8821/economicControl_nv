import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseLoginSchema = z.object({
  login_data: z.string().min(1, "El usuario/email es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

// ----------------------------------------------------------------------
// 2. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const LoginSchema = BaseLoginSchema;

// ----------------------------------------------------------------------
// 3. TIPO (Tipos para UI)
// ----------------------------------------------------------------------
export type LoginType = z.infer<typeof BaseLoginSchema>;
