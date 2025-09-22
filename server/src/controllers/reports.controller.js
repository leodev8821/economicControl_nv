import { getReportByWeek, createNewReport, getAllReports, getOneReport, updateOneReport, deleteReport } from '../models/report.model.js';
import { Week } from '../models/week.model.js';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

export default {
    allReports: async (req, res) => {
        try {
            const reports = await getAllReports();
            if (!reports || reports.length === 0) {
                return res.status(404).json({ ok: false, message: 'No autorizado para mostrar informes' });
            }
            res.status(200).json({
                ok: true,
                message: 'Informes obtenidos correctamente.',
                data: reports,
            });
        } catch (error) {
            console.error('Error en allReports:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en allReports',
                error: error.message
            });
        }
    },
    reportByWeek: async (req, res) => {
        try {
            const { week_start } = req.params;
            if (!week_start) {
                return res.status(400).json({ ok: false, message: 'Falta la fecha de inicio de la semana' });
            }
            // Buscar el id de la semana por fecha de inicio
            const week = await Week.findOne({ where: { start_date: week_start }, raw: true });
            if (!week) {
                return res.status(404).json({ ok: false, message: 'No se encontró la semana con esa fecha de inicio' });
            }
            const report = await getReportByWeek(week.id);
            if (!report) {
                return res.status(404).json({ ok: false, message: 'No se encontró informe para esta semana' });
            }
            res.status(200).json({
                ok: true,
                message: 'Informe obtenido correctamente.',
                data: report,
            });
        } catch (error) {
            console.error('Error en reportByWeek:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en reportByWeek',
                error: error.message
            });
        }
    },
    createReport: async (req, res) => {
        try {
            const { week_id, total_income, total_outcome, net_balance } = req.body;
            if (!week_id || total_income === undefined || total_outcome === undefined || net_balance === undefined) {
                return res.status(400).json({ ok: false, message: 'Faltan datos obligatorios para crear el informe' });
            }
            const newReport = await createNewReport({ week_id, total_income, total_outcome, net_balance });
            if (!newReport) {
                return res.status(409).json({ ok: false, message: 'Ya existe un informe para esta semana' });
            }
            res.status(201).json({
                ok: true,
                message: 'Informe creado correctamente.',
                data: newReport,
            });
        } catch (error) {
            console.error('Error en createReport:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en createReport',
                error: error.message
            });
        }
    },
    oneReport: async (req, res) => {
        try {
            const { id } = req.params;
            const report = await getOneReport(id);
            if (!report) {
                return res.status(404).json({ ok: false, message: 'Informe no encontrado' });
            }
            res.status(200).json({
                ok: true,
                message: 'Informe obtenido correctamente.',
                data: report,
            });
        } catch (error) {
            console.error('Error en oneReport:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en oneReport',
                error: error.message
            });
        }
    },
    updateReport: async (req, res) => {
        try {
            const { id } = req.params;
            const { week_id, total_income, total_outcome, net_balance } = req.body;
            const data = {};
            if (week_id !== undefined) data.week_id = week_id;
            if (total_income !== undefined) data.total_income = total_income;
            if (total_outcome !== undefined) data.total_outcome = total_outcome;
            if (net_balance !== undefined) data.net_balance = net_balance;
            if (Object.keys(data).length === 0) {
                return res.status(400).json({ ok: false, message: 'No se proporcionaron datos para actualizar el informe' });
            }
            const updatedReport = await updateOneReport(id, data);
            if (!updatedReport) {
                return res.status(404).json({ ok: false, message: 'Informe no encontrado o sin cambios' });
            }
            res.status(200).json({
                ok: true,
                message: 'Informe actualizado correctamente.',
                data: updatedReport,
            });
        } catch (error) {
            console.error('Error en updateReport:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en updateReport',
                error: error.message
            });
        }
    },
    deleteReport: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await deleteReport(id);
            if (!deleted) {
                return res.status(404).json({ ok: false, message: 'Informe no encontrado' });
            }
            res.status(200).json({
                ok: true,
                message: 'Informe eliminado correctamente.',
            });
        } catch (error) {
            console.error('Error en deleteReport:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en deleteReport',
                error: error.message
            });
        }
    }
}
