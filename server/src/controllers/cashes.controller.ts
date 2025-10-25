import { Request, Response } from 'express';
import handlerControllerError from '../utils/handleControllerError';
import { CashService } from '../services/cash.service';

export const cashesController = {
    allCash: async (_req: Request, res: Response) => {
        try {
            const cashes = await CashService.getAll();

            if (cashes.length === 0) {
                return res.status(404).json({ 
                    ok: false, 
                    message: 'No se encontraron ingresos.' 
                });
            }

            return res.status(200).json({
                ok: true,
                message: 'Cajas obtenidas correctamente.',
                data: cashes,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    oneCash: async (req: Request, res: Response) => {
        try {
            const { id, name } = req.params;
            const cashData = id ? { id: Number(id) } : { name: name! };
            
            const cash = await CashService.getOne(cashData);

            if (!cash) {
                return res.status(404).json({ message: 'No se encontró la caja con los parámetros proporcionados.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Caja obtenida correctamente.',
                data: cash,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    createCash: async (req: Request, res: Response) => {
        try {
            const newCash = await CashService.create(req.body);

            return res.status(201).json({
                ok: true,
                message: 'Caja creada correctamente.',
                data: newCash,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    updateCash: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ ok: false, message: 'Falta el ID en los parámetros de la URL.' });
            }
            const numericId = Number(id);

            const updatedCash = await CashService.update(numericId, req.body);

            if (!updatedCash) {
                return res.status(404).json({ ok: false, message: `No se encontró la caja con ID ${id} para actualizar.` });
            }

            return res.status(200).json({
                ok: true,
                message: 'Caja actualizada correctamente.',
                data: updatedCash,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    deleteCash: async (req: Request, res: Response) => {
        try {
            const { id, name } = req.params;
            const cashData = id ? { id: Number(id) } : { name: name! };

            const wasDeleted = await CashService.delete(cashData);

            if (!wasDeleted) {
                return res.status(404).json({ ok: false, message: 'No se encontró la caja para eliminar.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Caja eliminada correctamente.',
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    }
};