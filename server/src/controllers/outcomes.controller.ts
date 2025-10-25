import { Request, Response } from 'express';
import handlerControllerError from '../utils/handleControllerError';
import { OutcomeService } from '../services/outcome.service';

/**
 * Objeto que contiene todos los controladores (handlers de rutas)
 * para la gestión de Egresos.
 */
export const outcomesController = {
    
    /**
     * Función para obtener todos los egresos.
     */
    allOutcomes: async (_req: Request, res: Response) => {
        try {
            const outcomes = await OutcomeService.getAll();

            // Si no hay ingresos, el servicio ya nos devuelve un array vacío,
            // por lo que el controlador puede manejar el 404 aquí.
            if (outcomes.length === 0) {
                return res.status(404).json({ 
                    ok: false, 
                    message: 'No se encontraron ingresos.' 
                });
            }
            
            return res.status(200).json({
                ok: true,
                message: 'Egresos obtenidos correctamente.',
                data: outcomes,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    outcomesByCash: async (req: Request, res: Response) => {
        try {
            const { cash_id } = req.params;
            if (!cash_id) {
                throw new Error('Falta el ID de la caja en los parámetros de la URL.');
            }
            const numericCashId = parseInt(cash_id, 10);
            
            const outcomes = await OutcomeService.getByCashId(numericCashId);

            if (outcomes.length === 0) {
                return res.status(404).json({ 
                    ok: false, 
                    message: 'No se encontraron ingresos.' 
                });
            }

            return res.status(200).json({
                ok: true,
                message: 'Egresos por caja obtenidos correctamente.',
                data: outcomes,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    oneOutcome: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!id) {
                throw new Error('Falta el ID del egreso en los parámetros de la URL.');
            }
            const numericId = parseInt(id, 10);

            const outcome = await OutcomeService.getOneById(numericId);

            if (!outcome) {
                return res.status(404).json({ ok: false, message: 'Egreso no encontrado.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Egreso obtenido correctamente.',
                data: outcome,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    createOutcome: async (req: Request, res: Response) => {
        try {
            const newOutcome = await OutcomeService.create(req.body);

            return res.status(201).json({
                ok: true,
                message: 'Egreso creado correctamente.',
                data: newOutcome,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    updateOutcome: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!id) {
                throw new Error('Falta el ID del egreso en los parámetros de la URL.');
            }
            const numericId = parseInt(id, 10);

            const updatedOutcome = await OutcomeService.update(numericId, req.body);

            if (!updatedOutcome) {
                return res.status(404).json({ ok: false, message: 'Egreso no encontrado o sin cambios.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Egreso actualizado correctamente.',
                data: updatedOutcome,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    deleteOutcome: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!id) {
                throw new Error('Falta el ID del egreso en los parámetros de la URL.');
            }
            const numericId = parseInt(id, 10);

            const wasDeleted = await OutcomeService.delete(numericId);

            if (!wasDeleted) {
                return res.status(404).json({ ok: false, message: 'Egreso no encontrado.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Egreso eliminado correctamente.',
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    }
}