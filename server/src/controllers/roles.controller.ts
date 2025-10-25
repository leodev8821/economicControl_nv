import { Request, Response } from 'express';
import handlerControllerError from '../utils/handleControllerError';
import { RoleService } from '../services/role.service';

export const rolesController = {
    allRoles: async (_req: Request, res: Response) => {
        try {
            const roles = await RoleService.getAll();

            if (roles.length === 0) {
                return res.status(404).json({ ok: false, message: 'No se encontraron roles disponibles.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Roles obtenidos correctamente.',
                data: roles,
            });

        } catch (error) {
            return handlerControllerError(res, error);
        }
    }
}