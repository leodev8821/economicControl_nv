import { z } from "zod";
import { ROLE_VALUES } from "../auth/role.schema.js";

// ----------------------------------------------------------------------
// DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
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
  email: z.email("Email inválido").nullable().optional(),
  phone: z.string().nullable().optional(),
  is_visible: z.boolean().default(true).optional(),
});

// Esquema de permisos
const UserPermissionEntrySchema = z.object({
  application_id: z.number().int().positive(),
  role_id: z.number().int().positive(),
});

// Validación de Contraseña
const PasswordSchema = z
  .string()
  .min(6, "Mínimo 6 caracteres")
  .max(30, "Máximo 30 caracteres");

// ----------------------------------------------------------------------
// ESQUEMA DE RESPUESTA DEL BACKEND
// ----------------------------------------------------------------------
export const UserResponseSchema = BaseUserSchema.extend({
  permissions: z.array(UserPermissionEntrySchema),
});

// ----------------------------------------------------------------------
// ESQUEMA DE CREACIÓN
// ----------------------------------------------------------------------
export const UserCreationSchema = BaseUserSchema.extend({
  password: PasswordSchema,
  permissions: z.array(UserPermissionEntrySchema).optional().default([]),
});

// ----------------------------------------------------------------------
// ESQUEMA DE ACTUALIZACIÓN
// ----------------------------------------------------------------------
export const UserUpdateSchema = BaseUserSchema.omit({ id: true })
  .partial()
  .extend({
    password: PasswordSchema.optional(),
    permissions: z.array(UserPermissionEntrySchema).optional(),
  });

// ----------------------------------------------------------------------
// EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type UserCreateDTO = z.infer<typeof UserCreationSchema>;
export type UserUpdateDTO = z.infer<typeof UserUpdateSchema>;

// Para la UI
export type UserType = z.infer<typeof UserResponseSchema>;
