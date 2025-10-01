import { Request, Response } from 'express';
import { CashService } from '../services/cash.service';
import { CashAttributes } from '../models/cash.model';

/**
 * Función genérica para manejar errores en los controladores.
 * Se adapta para recibir errores del servicio y responder con el código HTTP apropiado.
 */
const handleControllerError = (res: Response, error: unknown) => {
    if (error instanceof Error) {
        if (error.message.includes('inválido') || error.message.includes('obligatorio') || error.message.includes('vacío') || error.message.includes('Falta')) {
            return res.status(400).json({ ok: false, message: error.message });
        }
        if (error.message.includes('Ya existe')) {
            return res.status(409).json({ ok: false, message: error.message });
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
 * Helper para formatear la respuesta del controlador
 */
const formatCashResponse = (cash: CashAttributes) => ({
    id: cash.id,
    name: cash.name,
    actual_amount: parseFloat(cash.actual_amount.toString()),
    pettyCash_limit: cash.pettyCash_limit !== null ? parseFloat(cash.pettyCash_limit.toString()) : null
});

export const cashesController = {
    allCash: async (_req: Request, res: Response) => {
        try {
            const cashes = await CashService.getAll();

            if (cashes.length === 0) {
                return res.status(404).json({ ok: false, message: 'No se encontraron cajas.' });
            }

            const formattedResponse = cashes.map(cash => formatCashResponse(cash));

            return res.status(200).json({
                ok: true,
                message: 'Cajas obtenidas correctamente.',
                data: formattedResponse,
            });
        } catch (error) {
            return handleControllerError(res, error);
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
                data: formatCashResponse(cash),
            });
        } catch (error) {
            return handleControllerError(res, error);
        }
    },

    createCash: async (req: Request, res: Response) => {
        try {
            const newCash = await CashService.create(req.body);

            return res.status(201).json({
                ok: true,
                message: 'Caja creada correctamente.',
                data: formatCashResponse(newCash),
            });
        } catch (error) {
            return handleControllerError(res, error);
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
                data: formatCashResponse(updatedCash),
            });
        } catch (error) {
            return handleControllerError(res, error);
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
            return handleControllerError(res, error);
        }
    }
};