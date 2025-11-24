import { z } from "zod";

export const LoginSchema = z.object({
  login_data: z.string().min(1, "El usuario/email es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginRequest = z.infer<typeof LoginSchema>;
