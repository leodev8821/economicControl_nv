import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import { ReportAttributes } from '../models/report.model';
// Nota: La dependencia de Week.findOne debe moverse a un WeekService
// y luego ser importado aquí para mantener la arquitectura limpia.

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

export const reportsController = {
    allReports: async (req: Request, res: Response) => {
        try {
            const reports = await ReportService.getAll();
            if (reports.length === 0) {
                return res.status(404).json({ ok: false, message: 'No se encontraron informes.' });
            }
            res.status(200).json({
                ok: true,
                message: 'Informes obtenidos correctamente.',
                data: reports,
            });
        } catch (error) {
            handleControllerError(res, error);
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
            res.status(200).json({
                ok: true,
                message: 'Informe obtenido correctamente.',
                data: report,
            });
        } catch (error) {
            handleControllerError(res, error);
        }
    },

    createReport: async (req: Request, res: Response) => {
        try {
            const newReport = await ReportService.create(req.body);
            res.status(201).json({
                ok: true,
                message: 'Informe creado correctamente.',
                data: newReport,
            });
        } catch (error) {
            handleControllerError(res, error);
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
            res.status(200).json({
                ok: true,
                message: 'Informe obtenido correctamente.',
                data: report,
            });
        } catch (error) {
            handleControllerError(res, error);
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
            res.status(200).json({
                ok: true,
                message: 'Informe actualizado correctamente.',
                data: updatedReport,
            });
        } catch (error) {
            handleControllerError(res, error);
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
            res.status(200).json({
                ok: true,
                message: 'Informe eliminado correctamente.',
            });
        } catch (error) {
            handleControllerError(res, error);
        }
    }
};