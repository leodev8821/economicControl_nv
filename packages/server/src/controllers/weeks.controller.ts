import { Request, Response } from "express";
import ControllerErrorHandler from "../utils/ControllerErrorHandler.js";
import {
  WeekActions,
  WeekCreationAttributes,
  WeekAttributes,
  type WeekSearchData,
} from "../models/finance-app/week.model.js";
import {
  WeekCreationSchema,
  WeekCreationRequest,
  WeekUpdateSchema,
  WeekUpdateRequest,
} from "@economic-control/shared";

export const weeksController = {
  // Obtiene todas las semanas
  allWeeks: async (_req: Request, res: Response) => {
    try {
      const weeks: WeekAttributes[] = await WeekActions.getAll();

      return res.status(200).json({
        ok: true,
        message:
          weeks.length === 0
            ? "No hay semanas registradas."
            : "Semanas obtenidas correctamente.",
        data: weeks,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener las semanas.",
      );
    }
  },

  // Obtiene una semana por ID o nombre
  oneWeek: async (req: Request, res: Response) => {
    try {
      const { id, week_start, week_end } = req.params;
      const searchCriteria: WeekSearchData = {};

      if (id) {
        searchCriteria.id = parseInt(id as string, 10);
      }
      if (week_start) {
        searchCriteria.week_start = week_start as string;
      }
      if (week_end) {
        searchCriteria.week_end = week_end as string;
      }

      const week = await WeekActions.getOne(searchCriteria);

      if (!week) {
        return res.status(404).json({
          message:
            "No se encontró la semana con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Semana obtenida correctamente.",
        data: week,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener la semana.");
    }
  },

  // Crea una nueva semana
  createWeek: async (req: Request, res: Response) => {
    try {
      const validationResult = WeekCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nueva semana inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const weekData: WeekCreationRequest = validationResult.data;

      const newWeek = await WeekActions.create(
        weekData as WeekCreationAttributes,
      );

      return res.status(201).json({
        ok: true,
        message: "Semana creada correctamente.",
        data: newWeek,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al crear la semana.");
    }
  },

  /**
   * Genera y guarda todas las semanas de un año.
   */
  generateWeeks: async (req: Request, res: Response) => {
    try {
      const { year } = req.body;
      const yearInt = parseInt(year, 10);

      const newWeeks = await WeekActions.generateWeeksForYear(yearInt);

      return res.status(201).json({
        ok: true,
        message: `Semanas para el año ${yearInt} generadas correctamente.`,
        data: newWeeks,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al generar las semanas del año.",
      );
    }
  },

  getWeeksByYear: async (req: Request, res: Response) => {
    try {
      const { year } = req.params;

      if (!year || (year as string).trim() === "") {
        throw new Error("Falta el parámetro de año en la URL.");
      }

      const yearInt = parseInt(year as string, 10);

      const weeks = await WeekActions.getByYear(yearInt);

      return res.status(200).json({
        ok: true,
        message: `Semanas del año ${yearInt} obtenidas correctamente.`,
        data: weeks,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener las semanas por año.",
      );
    }
  },

  updateWeek: async (req: Request, res: Response) => {
    try {
      const weekId = parseInt((req.params.id as string) || "0", 10);

      if (!weekId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de semana inválido" });
      }

      const validationResult = WeekUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de semana inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const updateData: WeekUpdateRequest = validationResult.data;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedWeek = await WeekActions.update(
        weekId,
        updateData as Partial<WeekCreationAttributes>,
      );

      if (!updatedWeek) {
        return res.status(404).json({
          ok: false,
          message: "Semana no encontrada para actualizar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Semana actualizada correctamente.",
        data: updatedWeek,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al actualizar la semana.",
      );
    }
  },

  deleteWeek: async (req: Request, res: Response) => {
    try {
      const weekId = parseInt((req.params.id as string) || "0", 10);

      if (!weekId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de semana inválido" });
      }

      const deleted = await WeekActions.delete({ id: weekId });

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          message: "No se encontró la semana para eliminar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Semana eliminada correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al eliminar la semana.");
    }
  },
};
