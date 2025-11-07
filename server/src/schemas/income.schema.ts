import { z } from "zod";
import { IncomeSource } from "../models/income.model";

const incomeSources = Object.values(IncomeSource) as [IncomeSource, ...IncomeSource[]];

export const IncomeCreationSchema = z.object({

    person_id: z.number().int().positive().optional(),

    week_id: z.number().int({
        error: "El ID de la semana es obligatorio",
    }).positive("El ID de la semana debe ser un número entero positivo"),

    date: z.string({
        error: "La fecha es obligatoria",
    }).regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de fecha es inválido (debe ser AAAA-MM-DD)"),

    amount: z.number({
        error: "El monto es obligatorio",
    }).positive("El monto debe ser un valor positivo")
    .refine(v => Math.round(v * 100) === v * 100, {
        message: "El monto solo puede tener dos decimales"}),
        
    source: z.enum(incomeSources, {
        error: "La fuente de ingreso es obligatoria",
    }),
});

export type IncomeCreationRequest = z.infer<typeof IncomeCreationSchema>;

// Para Actualización, todos los campos son opcionales
export const IncomeUpdateSchema = IncomeCreationSchema.partial();
export type IncomeUpdateRequest = z.infer<typeof IncomeUpdateSchema>;