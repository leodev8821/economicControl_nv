import { z } from "zod";
import { RoleType } from "./role.schema";

const allowedCreationRoles = [
  RoleType.ADMINISTRADOR,
  RoleType.SUPER_USER,
] as const;

export const UserCreationSchema = z.object({
  role: z.enum(allowedCreationRoles, {
    message:
      "El rol del usuario es obligatorio y debe ser ADMINISTRADOR o SUPER_USER",
  }),

  username: z
    .string({
      message: "El nombre de usuario es obligatorio",
    })
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(30, "El nombre de usuario no puede exceder los 30 caracteres"),

  password: z
    .string({
      message: "La contraseña es obligatoria",
    })
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(30, "La contraseña no puede exceder los 30 caracteres"),

  first_name: z
    .string({
      message: "El nombre es obligatorio",
    })
    .min(1, "El nombre no puede estar vacío")
    .max(50, "El nombre no puede exceder los 50 caracteres"),

  last_name: z
    .string({
      message: "El apellido es obligatorio",
    })
    .min(1, "El apellido no puede estar vacío")
    .max(50, "El apellido no puede exceder los 50 caracteres"),

  isVisible: z
    .boolean({
      message: "El campo de visibilidad es obligatorio",
    })
    .default(true)
    .optional(),
});

export type UserCreationRequest = z.infer<typeof UserCreationSchema>;

// Para Actualización, todos los campos son opcionales
export const UserUpdateSchema = UserCreationSchema.partial();
export type UserUpdateRequest = z.infer<typeof UserUpdateSchema>;
