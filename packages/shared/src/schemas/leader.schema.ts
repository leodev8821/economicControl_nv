import { z } from "zod";
import { ROLE_VALUES } from "./role.schema.js";

// 1. Base Schema (Datos del usuario SIN contraseña)
const BaseLeaderSchema = z.object({
  id: z.number().int().positive().optional(),

  role_name: z.enum(ROLE_VALUES, {
    message: "El rol es obligatorio",
  }),

  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(30, "Máximo 30 caracteres"),

  first_name: z.string().min(1, "El nombre es obligatorio").max(50),
  last_name: z.string().min(1, "El apellido es obligatorio").max(50),
  email: z.email("El correo es obligatorio"),
  phone: z.string().min(1, "El teléfono es obligatorio").max(15),

  is_visible: z.boolean().default(true).optional(),
});

// 2. Validación de Contraseña (Reutilizable)
const PasswordSchema = z
  .string()
  .min(6, "Mínimo 6 caracteres")
  .max(30, "Máximo 30 caracteres");

// 3. Schemas de Operación

// CREAR: Base + Contraseña obligatoria
export const LeaderCreationSchema = BaseLeaderSchema.extend({
  password: PasswordSchema,
});

// ACTUALIZAR: Todo opcional (incluida la contraseña)
export const LeaderUpdateSchema = BaseLeaderSchema.partial().extend({
  password: PasswordSchema.optional(),
});

// 4. Tipos
export type LeaderCreationRequest = z.infer<typeof LeaderCreationSchema>;
export type LeaderUpdateRequest = z.infer<typeof LeaderUpdateSchema>;

// ¡Importante! El tipo LeaderType NO debe tener password para seguridad en el Front
export type LeaderType = z.infer<typeof BaseLeaderSchema>;
