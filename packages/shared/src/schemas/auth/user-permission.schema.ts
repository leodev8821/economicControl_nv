import { z } from "zod";

// 1. Base Schema
const BaseUserPermissionSchema = z.object({
  id: z.number().int().positive().optional(),
  user_id: z.number().int().positive(),
  application_id: z.number().int().positive(),
  role_id: z.number().int().positive(),
});

// 2. Schemas de Operación

// CREAR/ASIGNAR: Todos los campos (menos ID) son obligatorios
export const UserPermissionCreationSchema = BaseUserPermissionSchema;

// ACTUALIZAR: Todo opcional
export const UserPermissionUpdateSchema = BaseUserPermissionSchema.partial();

// 3. Tipos inferidos
export type UserPermissionCreationRequest = z.infer<
  typeof UserPermissionCreationSchema
>;
export type UserPermissionUpdateRequest = z.infer<
  typeof UserPermissionUpdateSchema
>;

// Tipo para uso general en el Front/Servicios
export type UserPermissionType = z.infer<typeof BaseUserPermissionSchema>;
