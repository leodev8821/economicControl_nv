import { Request, Response } from "express";
import ControllerErrorHandler from "../../utils/ControllerErrorHandler.js";
import type { ReportSearchData } from "../../models/finance-app/report.model.js";
import {
  ReportActions,
  ReportCreationAttributes,
  ReportAttributes,
} from "../../models/finance-app/report.model.js";
import {
  ReportCreationSchema,
  ReportCreationRequest,
  ReportUpdateSchema,
  ReportUpdateRequest,
} from "@economic-control/shared";
import { IncomeActions } from "../../models/finance-app/income.model.js";
import { OutcomeActions } from "../../models/finance-app/outcome.model.js";

export const reportsController = {
  // Obtiene todas las reportes
  allReports: async (_req: Request, res: Response) => {
    try {
      const reports: ReportAttributes[] = await ReportActions.getAll();

      return res.status(200).json({
        ok: true,
        message:
          reports.length === 0
            ? "No hay reportes registrados."
            : "Reportes obtenidos correctamente.",
        data: reports,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener las reportes.",
      );
    }
  },

  // Obtiene una reporte por ID o week_id
  oneReport: async (req: Request, res: Response) => {
    try {
      const { id, week_id } = req.body;
      const searchCriteria: ReportSearchData = {};

      if (id) {
        searchCriteria.id = parseInt(id, 10);
      }
      if (week_id) {
        searchCriteria.week_id = parseInt(week_id, 10);
      }

      const report = await ReportActions.getOne(searchCriteria);

      if (!report) {
        return res.status(404).json({
          message:
            "No se encontró la reporte con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Reporte obtenida correctamente.",
        data: report,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener la reporte.");
    }
  },

  // Crea una nueva reporte
  createReport: async (req: Request, res: Response) => {
    try {
      const { week_id } = req.body;
      if (!week_id) {
        return res.status(400).json({
          ok: false,
          message: "ID de semana (week_id) es requerido para crear un reporte.",
        });
      }

      const targetWeekId = parseInt(week_id, 10);

      const incomesResult = (
        await IncomeActions.getIncomesByWeekId(targetWeekId)
      ).map((i) => ({
        ...i,
        amount: parseFloat(String(i.amount)),
      }));

      const outcomesResult = (
        await OutcomeActions.getOutcomesByWeekId(targetWeekId)
      ).map((o) => ({
        ...o,
        amount: parseFloat(String(o.amount)),
      }));

      if (incomesResult.length === 0 || outcomesResult.length === 0) {
        return res.status(400).json({
          ok: false,
          message:
            "No se pueden crear reportes sin ingresos o gastos registrados.",
        });
      }

      const incomeTotal: number = incomesResult.reduce(
        (sum, income) => sum + income.amount,
        0,
      );
      const outcomeTotal: number = outcomesResult.reduce(
        (sum, outcome) => sum + outcome.amount,
        0,
      );
      const balance: number = incomeTotal - outcomeTotal;

      req.body.week_id = week_id ? parseInt(week_id, 10) : 0;
      req.body.total_income = incomeTotal;
      req.body.total_outcome = outcomeTotal;
      req.body.net_balance = balance;

      const validationResult = ReportCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nueva reporte inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const reportData: ReportCreationRequest = validationResult.data;

      // Esto creará un nuevo registro si no existe, o actualizará el existente si week_id ya está registrado.
      const report = await ReportActions.upsert(
        reportData as ReportCreationAttributes,
      );

      return res.status(200).json({
        ok: true,
        message: "Reporte creado o actualizado correctamente.",
        data: report,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al crear la reporte.");
    }
  },

  updateReport: async (req: Request, res: Response) => {
    try {
      const reportId = parseInt((req.params.id as string) || "0", 10);

      if (!reportId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de reporte inválido" });
      }

      const validationResult = ReportUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de reporte inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const updateData: ReportUpdateRequest = validationResult.data;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedReport = await ReportActions.update(
        reportId,
        updateData as Partial<ReportCreationAttributes>,
      );

      if (!updatedReport) {
        return res.status(404).json({
          ok: false,
          message: "Reporte no encontrada para actualizar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Reporte actualizada correctamente.",
        data: updatedReport,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al actualizar la reporte.",
      );
    }
  },

  deleteReport: async (req: Request, res: Response) => {
    try {
      const reportId = parseInt((req.params.id as string) || "0", 10);

      if (!reportId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de reporte inválido" });
      }

      const deleted = await ReportActions.delete({ id: reportId });

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          message: "No se encontró la reporte para eliminar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Reporte eliminada correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al eliminar la reporte.",
      );
    }
  },
};
