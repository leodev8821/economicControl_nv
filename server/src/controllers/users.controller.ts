import { Request, Response } from 'express';
import handlerControllerError from '../utils/handleControllerError';
import { UserService } from '../services/user.service';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Inicializar dotenv
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

const sudoRole = process.env.SUDO_ROLE || 'SuperUser'; // Valor por defecto seguro


export const usersController = {    
    allUsers: async (_req: Request, res: Response) => {
        try {
            const users = await UserService.getAll();
            
            if (users.length === 0) {
                return res.status(404).json({ ok: false, message: 'No se encontraron usuarios.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Usuarios obtenidos correctamente.',
                data: users,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },
    
    oneUser: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const identifier = isNaN(Number(id)) ? id : Number(id);

            if (!identifier) {
                return res.status(400).json({ ok: false, message: 'Identificador inválido.' });
            }

            const user = await UserService.getOneVisible(identifier);

            if (!user) {
                return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
            }
            
            return res.status(200).json({
                ok: true,
                message: 'Usuario obtenido correctamente.',
                data: user,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },
    
    createUser: async (req: Request, res: Response) => {
        try {
            const newUser = await UserService.create(req.body, sudoRole);
            
            return res.status(201).json({
                ok: true,
                message: 'Usuario creado correctamente.',
                data: {
                    username: newUser.username,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name
                },
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },
    
    updateUser: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ ok: false, message: 'Identificador inválido.' });
            }

            const numericId = parseInt(id, 10);
            
            const updatedUser = await UserService.update(numericId, req.body, sudoRole);

            if (!updatedUser) {
                return res.status(404).json({ ok: false, message: 'Usuario no encontrado o datos no modificados' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Usuario actualizado correctamente.',
                data: updatedUser,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },
    
    deleteUser: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ ok: false, message: 'Identificador inválido.' });
            }
            
            const numericId = parseInt(id, 10);
            
            const deleted = await UserService.softDelete(numericId);

            if (!deleted) {
                return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Usuario eliminado correctamente (soft delete).',
                data: deleted,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },
};