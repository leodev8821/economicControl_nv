import { z } from "zod";
import { ROLE_VALUES } from "./role.schema.js";

// 1. Base Schema (Datos del usuario SIN contraseña)
const BaseUserSchema = z.object({
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
  email: z.email("Email inválido").optional(),
  phone: z.string().optional(),
  is_visible: z.boolean().default(true).optional(),
});

const UserPermissionEntrySchema = z.object({
  application_id: z.number().int().positive(),
  role_id: z.number().int().positive(),
});

// 2. Validación de Contraseña (Reutilizable)
const PasswordSchema = z
  .string()
  .min(6, "Mínimo 6 caracteres")
  .max(30, "Máximo 30 caracteres");

// 3. Schemas de Operación

// CREAR: Base + Contraseña obligatoria
export const UserCreationSchema = BaseUserSchema.extend({
  password: PasswordSchema,
  permissions: z.array(UserPermissionEntrySchema).optional().default([]),
});

// ACTUALIZAR: Todo opcional (incluida la contraseña)
export const UserUpdateSchema = BaseUserSchema.partial().extend({
  password: PasswordSchema.optional(),
  permissions: z.array(UserPermissionEntrySchema).optional(),
});

// 4. Tipos
export type UserCreationRequest = z.infer<typeof UserCreationSchema>;
export type UserUpdateRequest = z.infer<typeof UserUpdateSchema>;

// ¡Importante! El tipo UserType NO debe tener password para seguridad en el Front
export type UserType = z.infer<typeof BaseUserSchema>;
