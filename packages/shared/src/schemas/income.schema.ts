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
// 2. DEFINICIÓN BASE (ESTRUCTURA PURA)
// ----------------------------------------------------------------------
// Definimos esto en una constante interna (no exportada directamente como 'IncomeSchema')
// para poder usar .partial() más abajo.
const BaseIncomeSchema = z.object({
  // ID: Opcional (no existe al crear, sí al editar)
  id: z.number().int().positive().optional(),

  // PERSON_ID:
  person_id: z.preprocess((val) => {
    if (val === "" || val === null || typeof val === "undefined") return null;
    const parsed = Number(val);
    return isNaN(parsed) ? null : parsed;
  }, z.number().int().positive().nullable().default(null)),

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
  amount: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const cleanVal = val.replace(/,/g, "");
        return cleanVal === "" ? NaN : Number(cleanVal);
      }
      return val;
    },
    z
      .number({
        message: "El monto es obligatorio",
      })
      .positive("El monto debe ser un valor positivo")
      .refine((v) => Math.round(v * 100) === v * 100, {
        message: "El monto solo puede tener dos decimales",
      })
  ),

  // SOURCE:
  source: z.enum(INCOME_SOURCES, {
    message: "La fuente de ingreso es obligatoria",
  }),
});

// ----------------------------------------------------------------------
// 3. ESQUEMAS FINALES (REFINADOS Y PARCIALES)
// ----------------------------------------------------------------------

// Schema PRINCIPAL (Con validaciones de negocio, usado para Crear)
export const IncomeSchema = BaseIncomeSchema.superRefine((data, ctx) => {
  // Regla: Si es "Diezmo", debe tener una persona asociada
  if (data.source === "Diezmo" && !data.person_id) {
    ctx.addIssue({
      code: "custom",
      message: "Un diezmo debe estar asociado a una persona.",
      path: ["person_id"],
    });
  }
});

// Schema para ACTUALIZACIÓN (Todos los campos opcionales)
export const UpdateIncomeSchema = BaseIncomeSchema.partial();

// ----------------------------------------------------------------------
// 4. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------

export type IncomeType = z.infer<typeof IncomeSchema>;

// Alias para claridad
export const CreateIncomeSchema = IncomeSchema;

export type CreateIncomeDTO = z.infer<typeof CreateIncomeSchema>;
export type UpdateIncomeDTO = z.infer<typeof UpdateIncomeSchema>;
