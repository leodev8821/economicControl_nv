import { z } from "zod";
import { INCOME_SOURCES } from '../types/income';
import type { IncomeSource } from '../types/income'; 

// 1. Definición Base del Esquema
export const IncomeCreationSchema = z.object({
    // person_id: number | null
    person_id: z.preprocess((val) => {
        if (val === '' || typeof val === 'undefined' || val === null) return null;
        const n = Number(val);
        return Number.isNaN(n) ? null : n;
    }, z.number().int().positive().nullable().default(null)),

    // week_id: number (Requerido)
    week_id: z.coerce.number({ 
      required_error: "El ID de la semana es obligatorio",
      invalid_type_error: "El ID de la semana debe ser un número"
    }).int().positive("El ID de la semana debe ser un número entero positivo"),

    // date: string (DATEONLY) (Requerido: YYYY-MM-DD)
    // DATEONLY expected as YYYY-MM-DD. We'll validate pattern instead of using z.date().
    date: z.string({
      required_error: "La fecha es obligatoria"
    }).regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de fecha es inválido (debe ser AAAA-MM-DD)"),

    // amount: number (DECIMAL(10, 2), Requerido)
    amount: z.preprocess((val) => {
        if (typeof val === 'string') return Number(val.replace(/,/g, '.'));
        return val;
    }, z.number({ 
      required_error: "El monto es obligatorio",
      invalid_type_error: "El monto debe ser un número válido"
    })
        .refine(v => Number.isFinite(v), { message: "El monto debe ser un número" })
        .refine(v => v > 0, { message: "El monto debe ser un valor positivo" })
        .refine(v => Math.round(v * 100) === v * 100, { message: "El monto solo puede tener dos decimales" })),

    // source: IncomeSource (ENUM, Requerido)
    // Usamos el tipo IncomeSource importado
    source: z.enum(INCOME_SOURCES as unknown as [IncomeSource, ...IncomeSource[]], { 
      required_error: "La fuente de ingreso es obligatoria",
      invalid_type_error: "La fuente de ingreso seleccionada no es válida"
    }),
});

// 2. Aplicar la Validación de Negocio: Diezmo requiere person_id
export const FinalIncomeCreationSchema = IncomeCreationSchema.superRefine((data, ctx) => {
    // La regla de negocio de tu servicio es: Diezmo requiere person_id no nulo
    if (data.source === 'Diezmo' && data.person_id === null) {
        ctx.addIssue({
            code: "custom",
            message: "Un diezmo debe estar asociado a una persona.",
            path: ['person_id'],
        });
    }
});

export type IncomeFormData = z.infer<typeof FinalIncomeCreationSchema>;