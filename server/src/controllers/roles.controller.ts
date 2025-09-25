// controllers/roles.controller.ts
import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';

/**
 * Función genérica para manejar errores en los controladores.
 */
const handleControllerError = (res: Response, error: unknown) => {
    if (error instanceof Error) {
        if (error.message.includes('inválido') || error.message.includes('obligatorio') || error.message.includes('Falta')) {
            return res.status(400).json({ ok: false, message: error.message });
        }
        if (error.message.includes('no encontrado') || error.message.includes('No se encontraron')) {
            return res.status(404).json({ ok: false, message: error.message });
        }
        console.error('Error en el controlador:', error.message);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor.',
            error: error.message
        });
    }
    return res.status(500).json({
        ok: false,
        message: 'Error interno del servidor.',
        error: 'Error desconocido'
    });
};

export const rolesController = {
    allRoles: async (req: Request, res: Response) => {
        try {
            const roles = await RoleService.getAll();

            if (roles.length === 0) {
                // El mensaje se cambia a algo más preciso que "No autorizado"
                return res.status(404).json({ ok: false, message: 'No se encontraron roles disponibles.' });
            }

            // El formato de la respuesta se mantiene simple, ya que el repositorio ya devolvió objetos planos.
            res.status(200).json({
                ok: true,
                message: 'Roles obtenidos correctamente.',
                data: roles,
            });

        } catch (error) {
            handleControllerError(res, error);
        }
    }
}