import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN DE CONSTANTES (Single Source of Truth)
// ----------------------------------------------------------------------
export const INCOME_SOURCES = [
  "Diezmo",
  "Ofrenda",
  "Primicia",
  "Donación",
  "Evento",
  "Cafetería",
  "Otro",
] as const;

export type IncomeSource = (typeof INCOME_SOURCES)[number];

// ----------------------------------------------------------------------
// 2. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseIncomeSchema = z.object({
  // ID: Opcional (no existe al crear, sí al editar)
  id: z.number().int().positive().optional(),

  // PERSON_ID:
  person_id: z.coerce.number().int().positive().nullable().optional(),

  // CASH_ID:
  cash_id: z.coerce
    .number({
      message: "La caja es obligatoria",
    })
    .int()
    .positive(),

  // WEEK_ID:
  week_id: z.coerce
    .number({
      message: "El ID de la semana es obligatorio",
    })
    .int()
    .positive("El ID de la semana debe ser un número entero positivo"),

  // DATE:
  date: z
    .string({
      message: "La fecha es obligatoria",
    })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "El formato de fecha es inválido (debe ser AAAA-MM-DD)"
    ),

  // AMOUNT:
  amount: z.coerce
    .number({
      message: "El monto es obligatorio",
    })
    .positive("El monto debe ser un valor positivo")
    .refine((v) => Math.round(v * 100) === v * 100, {
      message: "El monto solo puede tener dos decimales",
    }),

  // SOURCE:
  source: z.enum(INCOME_SOURCES, {
    message: "La fuente de ingreso es obligatoria",
  }),
});

// ----------------------------------------------------------------------
// 3. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const IncomeCreationSchema = BaseIncomeSchema.superRefine(
  (data, ctx) => {
    // Regla: Si es "Diezmo", debe tener una persona asociada
    if (data.source === "Diezmo" && !data.person_id) {
      ctx.addIssue({
        code: "custom",
        message: "Un diezmo debe estar asociado a una persona.",
        path: ["person_id"],
      });
    }
  }
);

// ----------------------------------------------------------------------
// 4. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const IncomeUpdateSchema = BaseIncomeSchema.partial();

// ----------------------------------------------------------------------
// 5. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type IncomeCreationRequest = z.infer<typeof IncomeCreationSchema>;
export type IncomeUpdateRequest = z.infer<typeof IncomeUpdateSchema>;

// ----------------------------------------------------------------------
// 6. ESQUEMA para Carga Masiva (Formulario)
// ----------------------------------------------------------------------

// 1. Definimos el item del Bulk con la validación de "Diezmo"
export const BulkIncomeItemSchema = BaseIncomeSchema.omit({
  week_id: true,
}).superRefine((data, ctx) => {
  // Aplicamos la misma regla de negocio que en IncomeCreationSchema
  if (data.source === "Diezmo" && !data.person_id) {
    ctx.addIssue({
      code: "custom",
      message: "Un diezmo debe estar asociado a una persona.",
      path: ["person_id"],
    });
  }
});

// 2. El Schema del formulario ahora usará el item refinado
export const BulkIncomeSchema = z.object({
  common_week_id: z.coerce
    .number({ message: "Debe seleccionar una semana" })
    .int()
    .positive(),
  incomes: z
    .array(BulkIncomeItemSchema)
    .min(1, "Debe agregar al menos un ingreso"),
});

export type BulkIncomeItemRequest = z.infer<typeof BulkIncomeItemSchema>;
export type BulkIncomeRequest = z.infer<typeof BulkIncomeSchema>;

// Para la UI
export type IncomeType = z.infer<typeof BaseIncomeSchema>;
