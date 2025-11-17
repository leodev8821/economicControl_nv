import { z } from "zod";
import { OutcomeCategory } from "../models/outcome.model";

const outcomeCategories = Object.values(OutcomeCategory) as [OutcomeCategory, ...OutcomeCategory[]];

export const OutcomeCreationSchema = z.object({

    cash_id: z.coerce.number().int({
        error: "El ID de la caja es obligatorio",
    }).positive("El ID de la caja debe ser un número entero positivo"),

    week_id: z.coerce.number().int({
        error: "El ID de la semana es obligatorio",
    }).positive("El ID de la semana debe ser un número entero positivo"),

    date: z.string({
        error: "La fecha es obligatoria",
    }).regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de fecha es inválido (debe ser AAAA-MM-DD)"),

    amount: z.coerce.number({
        error: "El monto es obligatorio",
    }).positive("El monto debe ser un valor positivo")
    .refine(v => Math.round(v * 100) === v * 100, {
        message: "El monto solo puede tener dos decimales"}),
    
    description: z.string({
        error: "La descripción es obligatoria",
    }).min(1, "La descripción no puede estar vacía"),
        
    category: z.enum(outcomeCategories, {
        error: "La fuente de ingreso es obligatoria",
    }),
});

export type OutcomeCreationRequest = z.infer<typeof OutcomeCreationSchema>;

// Para Actualización, todos los campos son opcionales
export const OutcomeUpdateSchema = OutcomeCreationSchema.partial();
export type OutcomeUpdateRequest = z.infer<typeof OutcomeUpdateSchema>;