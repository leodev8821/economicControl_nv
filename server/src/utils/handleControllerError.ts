import { Response } from 'express';

/**
 * Función genérica para manejar errores en los controladores.
 * Los errores de validación (400) o de negocio ya vienen del servicio.
 */
const handleControllerError = (res: Response, error: unknown) => {
    // Si el error tiene un mensaje, se asume que es un error de negocio o validación.
    // Ej. 'ID inválido', 'Faltan datos obligatorios'.
    if (error instanceof Error) {
        if (error.message.includes('inválido') || error.message.includes('obligatorio') || error.message.includes('vacío') || error.message.includes('no existe')) {
            return res.status(400).json({ ok: false, message: error.message });
        }
        // Si el error es de tipo 'no encontrado', enviamos un 404
        if (error.message.includes('No se encontraron') || error.message.includes('no encontrado')) {
             return res.status(404).json({ ok: false, message: error.message });
        }
        if (error.message.includes('Contraseña incorrecta') || error.message.includes('deshabilitada')) {
            return res.status(401).json({ ok: false, message: error.message });
        }
        if (error.message.includes('No autorizado')) {
            return res.status(403).json({ ok: false, message: error.message });
        }
        if (error.message.includes('ya existe')) {
            return res.status(409).json({ ok: false, message: error.message });
        }
        // Para cualquier otro error (del servidor o BD)
        console.error('Error en el controlador:', error.message);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor.',
            error: error.message
        });
    }
    // Para errores desconocidos
    return res.status(500).json({
        ok: false,
        message: 'Error interno del servidor.',
        error: 'Error desconocido'
    });
};

export default handleControllerError;