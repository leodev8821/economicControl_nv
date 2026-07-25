import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BaseProductSchema = z.object({
    id: z.number().int().positive().optional(),

    code: z.string().min(1, 'El código es obligatorio'),

    name: z.string().min(1, 'El nombre no puede estar vacío'),

    unit_price: z.coerce
        .number({ message: "El precio debe ser mayor a 0" })
        .refine((v) => Math.round(v * 100) === v * 100, {
            message: "El precio solo puede tener dos decimales",
        }),

    is_active: z.boolean().default(true),
});

// ----------------------------------------------------------------------
// 2. ESQUEMA de Creación
// ----------------------------------------------------------------------
export const ProductCreationSchema = BaseProductSchema.omit({id: true});

// ----------------------------------------------------------------------
// 3. ESQUEMA de Actualización
// ----------------------------------------------------------------------
export const ProductUpdateSchema = BaseProductSchema.partial();

// ----------------------------------------------------------------------
// 4. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type ProductCreationDTO = z.infer<typeof ProductCreationSchema>;
export type ProductUpdateDTO = z.infer<typeof ProductUpdateSchema>;

// Para UI
export type ProductType = z.infer<typeof BaseProductSchema>;