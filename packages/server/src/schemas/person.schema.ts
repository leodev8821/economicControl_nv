import { z } from "zod";

export const PersonCreationSchema = z.object({

    first_name: z.string({
        error: "El nombre es obligatorio",
    }).min(1, "El nombre no puede estar vacío"),

    last_name: z.string({
        error: "El apellido es obligatorio",
    }).min(1, "El apellido no puede estar vacío"),

    dni: z.string({
        error: "El DNI es obligatorio",
    }).min(1, "El DNI no puede estar vacío").max(9, "El DNI no puede tener más de 9 caracteres"),

});

export type PersonCreationRequest = z.infer<typeof PersonCreationSchema>;

// Para Actualización, todos los campos son opcionales
export const PersonUpdateSchema = PersonCreationSchema.partial();
export type PersonUpdateRequest = z.infer<typeof PersonUpdateSchema>;