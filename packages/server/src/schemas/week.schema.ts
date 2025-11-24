import { z } from "zod";

export const WeekCreationSchema = z.object({

    week_start: z.string({
        error: "La fecha de inicio de semana es obligatoria",
    }).regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de fecha es inválido (debe ser AAAA-MM-DD)"),

    week_end: z.string({
        error: "La fecha de final de semana es obligatoria",
    }).regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de fecha es inválido (debe ser AAAA-MM-DD)"),
});

export type WeekCreationRequest = z.infer<typeof WeekCreationSchema>;

// Para Actualización, todos los campos son opcionales
export const WeekUpdateSchema = WeekCreationSchema.partial();
export type WeekUpdateRequest = z.infer<typeof WeekUpdateSchema>;