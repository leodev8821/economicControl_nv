import { Transaction } from "sequelize";
import { PrintConfigModel, PrintConfigAttributes } from "@models/cafeteria/print-config.model.js";

/**
 * Este servicio está enfocado en gestionar la configuración general de impresión del sistema.
 * Trata la tabla como un Singleton (un único registro por negocio).
 */

/**
 * Obtiene la configuración de impresión actual.
 */
async function getConfig(t?: Transaction): Promise<PrintConfigAttributes> {
    // Buscamos el primer registro disponible
    const config = await PrintConfigModel.findOne({
        transaction: t,
    });

    if (!config) {
        throw new Error("Configuración de impresión no encontrada. Asegúrese de inicializarla primero.");
    }

    // Retornamos el objeto plano como en el estándar de tus servicios
    return config.get({ plain: true });
}

/**
 * Crea la configuración inicial por defecto. 
 * Útil para la primera vez que se despliega el sistema.
 */
async function initializeConfig(t?: Transaction): Promise<PrintConfigAttributes> {
    const existingConfig = await PrintConfigModel.findOne({ transaction: t });
    
    if (existingConfig) {
        return existingConfig.get({ plain: true });
    }

    const newConfig = await PrintConfigModel.create({
        nombre_negocio: "Mi Negocio",
        ancho_papel: 80,
        font_size: 1,
        factura_imprime_servidor: false,
        factura_auto_print: false,
    }, { transaction: t });

    return newConfig.get({ plain: true });
}

/**
 * Actualiza la configuración de impresión existente.
 */
async function updateConfig(
    data: Partial<Omit<PrintConfigAttributes, "id">>, 
    t?: Transaction
): Promise<PrintConfigAttributes> {
    const config = await PrintConfigModel.findOne({ transaction: t });

    if (!config) {
        throw new Error("No se puede actualizar: Configuración de impresión no encontrada");
    }

    // Actualizamos usando el método de instancia
    await config.update(data, { transaction: t });

    return config.get({ plain: true });
}

/**
 * Obtiene exclusivamente los flags de impresión para agilizar peticiones del frontend
 */
async function getFacturaFlags(t?: Transaction): Promise<Partial<PrintConfigAttributes>> {
    const config = await PrintConfigModel.findOne({
        attributes: [
            "impresora_facturas", 
            "factura_imprime_servidor",  
            "factura_auto_print"
        ],
        transaction: t,
    });

    if (!config) {
        throw new Error("Configuración de impresión no encontrada");
    }

    return config.get({ plain: true });
}


export const printConfigService = {
    getConfig,
    initializeConfig,
    updateConfig,
    getFacturaFlags
};