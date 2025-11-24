import { z } from "zod";

export const CashCreationSchema = z.object({
  name: z
    .string({
      message: "El nombre es obligatorio",
    })
    .min(1, "El nombre no puede estar vacío"),

  actual_amount: z.coerce
    .number({
      message: "El monto es obligatorio",
    })
    .refine((v) => Math.round(v * 100) === v * 100, {
      message: "El monto solo puede tener dos decimales",
    }),

  pettyCash_limit: z.coerce
    .number()
    .positive("El límite de caja chica debe ser un valor positivo")
    .optional(),
});

export type CashCreationRequest = z.infer<typeof CashCreationSchema>;

// Para Actualización, todos los campos son opcionales
export const CashUpdateSchema = CashCreationSchema.partial();
export type CashUpdateRequest = z.infer<typeof CashUpdateSchema>;
