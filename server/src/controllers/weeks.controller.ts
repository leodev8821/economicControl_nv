import { Request, Response } from 'express';
import { WeekService } from '../services/week.service';

/**
 * Función genérica para manejar errores en los controladores.
 */
const handleControllerError = (res: Response, error: unknown) => {
    if (error instanceof Error) {
        if (error.message.includes('inválido') || error.message.includes('obligatorio') || error.message.includes('Falta')) {
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

export const weeksController = {
    getWeeksByYear: async (req: Request, res: Response) => {
        try {
            const { year } = req.params;
            const yearInt = parseInt(year, 10);
            
            const weeks = await WeekService.getByYear(yearInt);

            res.status(200).json({
                ok: true,
                message: `Semanas del año ${yearInt} obtenidas correctamente.`,
                data: weeks,
            });
        } catch (error) {
            handleControllerError(res, error);
        }
    },

    getWeekData: async (req: Request, res: Response) => {
        const { weekId } = req.params;
        const numericWeekId = parseInt(weekId, 10);

        try {
            const financialData = await WeekService.getWeekFinancialData(numericWeekId);
            
            res.status(200).json({
                ok: true,
                message: 'Datos de la semana obtenidos correctamente.',
                data: financialData,
            });
        } catch (error) {
            handleControllerError(res, error);
        }
    },

    generateWeeks: async (req: Request, res: Response) => {
        try {
            const { year } = req.body;
            const yearInt = parseInt(year, 10);

            const newWeeks = await WeekService.generateWeeksForYear(yearInt);

            res.status(201).json({
                ok: true,
                message: `Semanas para el año ${yearInt} generadas correctamente.`,
                data: newWeeks
            });
        } catch (error) {
            handleControllerError(res, error);
        }
    }
};