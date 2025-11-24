import { z } from "zod";

export const ReportCreationSchema = z.object({

    week_id: z.coerce.number().int("El ID de la semana debe ser un número entero").positive("El ID de la semana debe ser un número positivo"),
    
    total_income: z.coerce.number({
        error: "El total de ingresos es obligatorio",
    }).positive("El total de ingresos debe ser un valor positivo")
    .refine(v => Math.round(v * 100) === v * 100, {
        message: "El total de ingresos solo puede tener dos decimales"}),

    total_outcome: z.coerce.number({
        error: "El total de egresos es obligatorio",
    }).positive("El total de egresos debe ser un valor positivo")
    .refine(v => Math.round(v * 100) === v * 100, {
        message: "El total de egresos solo puede tener dos decimales"}),
    
    net_balance: z.coerce.number()
});

export type ReportCreationRequest = z.infer<typeof ReportCreationSchema>;

// Para Actualización, todos los campos son opcionales
export const ReportUpdateSchema = ReportCreationSchema.partial();
export type ReportUpdateRequest = z.infer<typeof ReportUpdateSchema>;