import { z } from "zod";

export const OUTCOME_CATEGORY = ["Fijos", "Variables", "Otro"] as const;
export type OutcomeCategory = (typeof OUTCOME_CATEGORY)[number];

export const OutcomeCreationSchema = z.object({
  cash_id: z.coerce
    .number()
    .int({
      message: "El ID de la caja es obligatorio",
    })
    .positive("El ID de la caja debe ser un número entero positivo"),

  week_id: z.coerce
    .number()
    .int({
      message: "El ID de la semana es obligatorio",
    })
    .positive("El ID de la semana debe ser un número entero positivo"),

  date: z
    .string({
      message: "La fecha es obligatoria",
    })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "El formato de fecha es inválido (debe ser AAAA-MM-DD)"
    ),

  amount: z.coerce
    .number({
      message: "El monto es obligatorio",
    })
    .positive("El monto debe ser un valor positivo")
    .refine((v) => Math.round(v * 100) === v * 100, {
      message: "El monto solo puede tener dos decimales",
    }),

  description: z
    .string({
      message: "La descripción es obligatoria",
    })
    .min(1, "La descripción no puede estar vacía"),

  category: z.enum(OUTCOME_CATEGORY, {
    message: "La categoría de egreso es obligatoria",
  }),
});

export type OutcomeCreationRequest = z.infer<typeof OutcomeCreationSchema>;

// Para Actualización, todos los campos son opcionales
export const OutcomeUpdateSchema = OutcomeCreationSchema.partial();
export type OutcomeUpdateRequest = z.infer<typeof OutcomeUpdateSchema>;
