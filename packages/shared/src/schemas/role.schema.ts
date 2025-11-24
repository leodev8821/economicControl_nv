import { z } from "zod";

export const RoleType = {
  ADMINISTRADOR: "ADMINISTRADOR",
  SUPER_USER: "SUPER_USER",
} as const;

export type RoleType = (typeof RoleType)[keyof typeof RoleType];

const roleTypes = Object.values(RoleType) as [RoleType, ...RoleType[]];

export const RoleCreationSchema = z.object({
  source: z.enum(roleTypes, {
    message: "El tipo de rol es obligatorio",
  }),
});

export type RoleCreationRequest = z.infer<typeof RoleCreationSchema>;

// Para Actualización, todos los campos son opcionales
export const RoleUpdateSchema = RoleCreationSchema.partial();
export type RoleUpdateRequest = z.infer<typeof RoleUpdateSchema>;
