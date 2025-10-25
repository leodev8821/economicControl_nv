import { Request, Response } from 'express';
import handlerControllerError from '../utils/handleControllerError';
import { ReportService } from '../services/report.service';

export const reportsController = {
    allReports: async (_req: Request, res: Response) => {
        try {
            const reports = await ReportService.getAll();
            if (reports.length === 0) {
                return res.status(404).json({ ok: false, message: 'No se encontraron informes.' });
            }
            return res.status(200).json({
                ok: true,
                message: 'Informes obtenidos correctamente.',
                data: reports,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },
    
    // Esta función necesita una pequeña refactorización en el backend para buscar la semana
    // por fecha antes de llamar al ReportService. O bien, podrías tener una ruta que reciba
    // directamente el week_id. Por ahora, asumo que la búsqueda se hace aquí.
    reportByWeek: async (req: Request, res: Response) => {
        try {
            const { week_id } = req.params;
            if (!week_id) {
                 throw new Error('Falta el ID de la semana en los parámetros de la URL.');
            }
            const numericWeekId = parseInt(week_id, 10);
            
            const report = await ReportService.getOneByWeekId(numericWeekId);
            if (!report) {
                return res.status(404).json({ ok: false, message: 'No se encontró informe para esta semana.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Informe obtenido correctamente.',
                data: report,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    createReport: async (req: Request, res: Response) => {
        try {
            const newReport = await ReportService.create(req.body);
            return res.status(201).json({
                ok: true,
                message: 'Informe creado correctamente.',
                data: newReport,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    oneReport: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!id) {
                throw new Error('Falta el ID del informe en los parámetros de la URL.');
            }
            const numericId = parseInt(id, 10);
            
            const report = await ReportService.getOneById(numericId);
            if (!report) {
                return res.status(404).json({ ok: false, message: 'Informe no encontrado.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Informe obtenido correctamente.',
                data: report,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    updateReport: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!id) {
                throw new Error('Falta el ID del informe en los parámetros de la URL.');
            }
            const numericId = parseInt(id, 10);
            
            const updatedReport = await ReportService.update(numericId, req.body);
            if (!updatedReport) {
                return res.status(404).json({ ok: false, message: 'Informe no encontrado o sin cambios.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Informe actualizado correctamente.',
                data: updatedReport,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    deleteReport: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!id) {
                throw new Error('Falta el ID del informe en los parámetros de la URL.');
            }
            const numericId = parseInt(id, 10);
            
            const wasDeleted = await ReportService.delete(numericId);
            if (!wasDeleted) {
                return res.status(404).json({ ok: false, message: 'Informe no encontrado.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Informe eliminado correctamente.',
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    }
};