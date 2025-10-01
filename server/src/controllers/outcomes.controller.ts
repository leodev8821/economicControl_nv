import { Request, Response } from 'express';
import { OutcomeService } from '../services/outcome.service';
import { OutcomeAttributes } from '../models/outcome.model';

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

/**
 * Helper para formatear la respuesta
 */
const formatOutcomeResponse = (outcome: OutcomeAttributes) => ({
    id: outcome.id,
    cash_id: outcome.cash_id,
    week_id: outcome.week_id,
    date: outcome.date,
    amount: parseFloat(outcome.amount.toString()),
    description: outcome.description,
    category: outcome.category,
});

export const outcomesController = {
    allOutcomes: async (_req: Request, res: Response) => {
        try {
            const outcomes = await OutcomeService.getAll();

            if (outcomes.length === 0) {
                return res.status(404).json({ ok: false, message: 'No se encontraron egresos.' });
            }
            const formattedOutcomes = outcomes.map(o => formatOutcomeResponse(o));
            
            return res.status(200).json({
                ok: true,
                message: 'Egresos obtenidos correctamente.',
                data: formattedOutcomes,
            });
        } catch (error) {
            return handleControllerError(res, error);
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
                return res.status(404).json({ ok: false, message: 'No se encontraron egresos para esta caja.' });
            }

            const formattedOutcomes = outcomes.map(o => formatOutcomeResponse(o));

            return res.status(200).json({
                ok: true,
                message: 'Egresos obtenidos correctamente.',
                data: formattedOutcomes,
            });
        } catch (error) {
            return handleControllerError(res, error);
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
                data: formatOutcomeResponse(outcome),
            });
        } catch (error) {
            return handleControllerError(res, error);
        }
    },

    createOutcome: async (req: Request, res: Response) => {
        try {
            const newOutcome = await OutcomeService.create(req.body);

            return res.status(201).json({
                ok: true,
                message: 'Egreso creado correctamente.',
                data: formatOutcomeResponse(newOutcome),
            });
        } catch (error) {
            return handleControllerError(res, error);
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
                data: formatOutcomeResponse(updatedOutcome),
            });
        } catch (error) {
            return handleControllerError(res, error);
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
            return handleControllerError(res, error);
        }
    }
}