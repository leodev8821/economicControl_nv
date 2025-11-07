import { z } from "zod";

export const CashCreationSchema = z.object({

    name: z.string({
        error: "El nombre es obligatorio",
    }).min(1, "El nombre no puede estar vacío"),
    
    actual_amount: z.number({
        error: "El monto es obligatorio",
    }).positive("El monto debe ser un valor positivo")
    .refine(v => Math.round(v * 100) === v * 100, {
        message: "El monto solo puede tener dos decimales"}),

    pettyCash_limit: z.number().positive("El límite de caja chica debe ser un valor positivo").optional(),

});

export type CashCreationRequest = z.infer<typeof CashCreationSchema>;

// Para Actualización, todos los campos son opcionales
export const CashUpdateSchema = CashCreationSchema.partial();
export type CashUpdateRequest = z.infer<typeof CashUpdateSchema>;