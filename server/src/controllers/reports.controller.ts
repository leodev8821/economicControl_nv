import { Request, Response } from 'express';
import ControllerErrorHandler from '../utils/ControllerErrorHandler';
import type { ReportSearchData } from '../models/report.model';
import { ReportActions, ReportCreationAttributes, ReportAttributes } from '../models/report.model';
import { ReportCreationSchema, ReportCreationRequest, ReportUpdateSchema, ReportUpdateRequest } from '../schemas/report.schema';

export const reportsController = {
    // Obtiene todas las reportes
    allReports: async (_req: Request, res: Response) => {
        try {
            const reports: ReportAttributes[] = await ReportActions.getAll();

            if (reports.length === 0) {
                return res.status(404).json({ 
                    ok: false, 
                    message: 'No se encontraron reportes.' 
                });
            }

            return res.status(200).json({
                ok: true,
                message: 'Reportes obtenidas correctamente.',
                data: reports,
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al obtener las reportes.');
        }
    },

    // Obtiene una reporte por ID o week_id
    oneReport: async (req: Request, res: Response) => {
        try {
            const { id, week_id } = req.params;
            const searchCriteria: ReportSearchData = {};

            if (id) {
                searchCriteria.id = parseInt(id, 10);
            }
            if (week_id) {
                searchCriteria.week_id = parseInt(week_id, 10);
            }
            
            const report = await ReportActions.getOne(searchCriteria);

            if (!report) {
                return res.status(404).json({ message: 'No se encontró la reporte con los parámetros proporcionados.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Reporte obtenida correctamente.',
                data: report,
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al obtener la reporte.' );
        }
    },

    // Crea una nueva reporte
    createReport: async (req: Request, res: Response) => {
        try {

            const validationResult = ReportCreationSchema.safeParse(req.body);

            if (!validationResult.success) {
                return res.status(400).json({
                    ok: false,
                    message: 'Datos de nueva reporte inválidos.',
                    errors: validationResult.error.issues,
                });
            }

            const reportData: ReportCreationRequest = validationResult.data;
            
            const newReport = await ReportActions.create(reportData as ReportCreationAttributes);

            return res.status(201).json({
                ok: true,
                message: 'Reporte creada correctamente.',
                data: newReport,
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al crear la reporte.' );
        }
    },

    updateReport: async (req: Request, res: Response) => {
        try {
            const reportId = parseInt(req.params.id || '0', 10);

            if (!reportId) {
                return res.status(400).json({ ok: false, message: 'ID de reporte inválido' });
            }
            
            const validationResult = ReportUpdateSchema.safeParse(req.body);

            if (!validationResult.success) {
                return res.status(400).json({
                    ok: false,
                    message: 'Datos de actualización de reporte inválidos.',
                    errors: validationResult.error.issues,
                });
            }

            const updateData : ReportUpdateRequest = validationResult.data;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ ok: false, message: 'No se proporcionaron datos para actualizar.' });
            }

            const updatedReport = await ReportActions.update(reportId, updateData as Partial<ReportCreationAttributes>);

            if (!updatedReport) {
                return res.status(404).json({ ok: false, message: 'Reporte no encontrada para actualizar.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Reporte actualizada correctamente.',
                data: updatedReport,
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al actualizar la reporte.' );
        }
    },

    deleteReport: async (req: Request, res: Response) => {
        try {
            const reportId = parseInt(req.params.id || '0', 10);

            if (!reportId) {
                return res.status(400).json({ ok: false, message: 'ID de reporte inválido' });
            }

            const deleted = await ReportActions.delete({ id: reportId });

            if (!deleted) {
                return res.status(404).json({ ok: false, message: 'No se encontró la reporte para eliminar.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Reporte eliminada correctamente.',
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al eliminar la reporte.' );
        }
    }
};