import { z } from "zod";

// ----------------------------------------------------------------------
// 1. DEFINICIÓN BASE (Campos comunes y limpieza de datos)
// ----------------------------------------------------------------------
const BasePrintConfigSchema = z.object({
    id: z.number().int().positive().optional(),

    // Información del negocio
    nombre_negocio: z.string().min(1, 'El nombre del negocio es obligatorio'),
    direccion: z.string().optional().nullable(),
    telefono: z.string().optional().nullable(),
    cif: z.string().optional().nullable(),
    pie_pagina: z.string().optional().nullable(),

    // Formato
    ancho_papel: z.coerce.number().int().positive().default(80),
    font_size: z.coerce.number().positive().default(1),

    // Flags de configuración (Se coercionan para manejar '0'/'1' o true/false)
    factura_imprime_servidor: z.coerce.boolean(),
    factura_auto_print: z.coerce.boolean(),

    // Impresoras
    impresora_facturas: z.string().optional().nullable(),

    // Imágenes (Buffers en backend, Base64 o File en otros contextos)
    logo_data: z.any().optional(),
    logo_tipo: z.string().optional().nullable(),
    qr_data: z.any().optional(),
    qr_tipo: z.string().optional().nullable(),
});

// ----------------------------------------------------------------------
// 2. ESQUEMAS DE ACTUALIZACIÓN Y VISTAS PARCIALES
// ----------------------------------------------------------------------

// Esquema de Actualización (Normalmente se actualiza un único registro de configuración)
export const PrintConfigUpdateSchema = BasePrintConfigSchema.omit({ 
    id: true 
}).partial();

// Esquema parcial solo para las consultas rápidas de facturación desde el frontend
export const FacturaConfigFlagsSchema = BasePrintConfigSchema.pick({
    impresora_facturas: true,
    factura_imprime_servidor: true,
    factura_auto_print: true,
});

// ----------------------------------------------------------------------
// 3. EXPORTACIÓN DE TIPOS E INTERFACES
// ----------------------------------------------------------------------
export type PrintConfigUpdateDTO = z.infer<typeof PrintConfigUpdateSchema>;
export type FacturaConfigFlagsDTO = z.infer<typeof FacturaConfigFlagsSchema>;

// Para UI y tipado base en el repositorio
export type PrintConfigType = z.infer<typeof BasePrintConfigSchema>;