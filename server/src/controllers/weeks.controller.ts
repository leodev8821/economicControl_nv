import { Request, Response } from 'express';
import handlerControllerError from '../utils/handleControllerError';
import { WeekService } from '../services/week.service';

export const weeksController = {
    allWeeks: async (_req: Request, res: Response) => {
        try {
            const weeks = await WeekService.getAll();

            if (weeks.length === 0) {
                return res.status(404).json({ ok: false, message: 'No se encontraron semanas.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Semanas obtenidas correctamente.',
                data: weeks,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    getWeeksByYear: async (req: Request, res: Response) => {
        try {
            const { year } = req.params;

            if (!year || year.trim() === '') {
                throw new Error('Falta el parámetro de año en la URL.');
            }

            const yearInt = parseInt(year, 10);
            
            const weeks = await WeekService.getByYear(yearInt);

            return res.status(200).json({
                ok: true,
                message: `Semanas del año ${yearInt} obtenidas correctamente.`,
                data: weeks,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    getWeekData: async (req: Request, res: Response) => {
        const { weekId } = req.params;

        if (!weekId || weekId.trim() === '') {
                throw new Error('Falta el ID de la semana en la URL.');
        }

        const numericWeekId = parseInt(weekId, 10);

        try {
            const financialData = await WeekService.getWeekFinancialData(numericWeekId);
            
            return res.status(200).json({
                ok: true,
                message: 'Datos de la semana obtenidos correctamente.',
                data: financialData,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    generateWeeks: async (req: Request, res: Response) => {
        try {
            const { year } = req.body;
            const yearInt = parseInt(year, 10);

            const newWeeks = await WeekService.generateWeeksForYear(yearInt);

            return res.status(201).json({
                ok: true,
                message: `Semanas para el año ${yearInt} generadas correctamente.`,
                data: newWeeks
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    }
};