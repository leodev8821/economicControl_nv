import { Request, Response } from "express";
import ControllerErrorHandler from "../utils/ControllerErrorHandler.ts";
import type { OutcomeSearchData } from "../models/outcome.model.ts";
import {
  OutcomeActions,
  OutcomeCreationAttributes,
  OutcomeAttributes,
} from "../models/outcome.model.ts";
import {
  OutcomeCreationSchema,
  OutcomeCreationRequest,
  OutcomeUpdateSchema,
  OutcomeUpdateRequest,
} from "@economic-control/shared";

export const outcomesController = {
  // Obtiene todas las egresos
  allOutcomes: async (_req: Request, res: Response) => {
    try {
      const outcomes: OutcomeAttributes[] = await OutcomeActions.getAll();

      if (outcomes.length === 0) {
        return res.status(404).json({
          ok: false,
          message: "No se encontraron egresos.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Egresos obtenidas correctamente.",
        data: outcomes,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener las egresos."
      );
    }
  },

  // Obtiene una egreso por ID o nombre
  oneOutcome: async (req: Request, res: Response) => {
    try {
      const { id, cash_id, category } = req.params;
      const searchCriteria: OutcomeSearchData = {};

      if (id) {
        searchCriteria.id = parseInt(id, 10);
      }
      if (cash_id) {
        searchCriteria.cash_id = parseInt(cash_id, 10);
      }
      if (category) {
        searchCriteria.category = category;
      }

      const outcome = await OutcomeActions.getOne(searchCriteria);

      if (!outcome) {
        return res.status(404).json({
          message:
            "No se encontró la egreso con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Egreso obtenida correctamente.",
        data: outcome,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener la egreso.");
    }
  },

  outcomesByCash: async (req: Request, res: Response) => {
    try {
      const { cash_id } = req.params;
      if (!cash_id) {
        throw new Error("Falta el ID de la caja en los parámetros de la URL.");
      }
      const numericCashId = parseInt(cash_id, 10);

      const outcomes = await OutcomeActions.getOutcomesByCashId(numericCashId);

      if (outcomes.length === 0) {
        return res.status(404).json({
          ok: false,
          message: "No se encontraron ingresos.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Egresos por caja obtenidos correctamente.",
        data: outcomes,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener los egresos por caja."
      );
    }
  },

  // Crea una nueva egreso
  createOutcome: async (req: Request, res: Response) => {
    try {
      const validationResult = OutcomeCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nueva egreso inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const outcomeData: OutcomeCreationRequest = validationResult.data;

      const newOutcome = await OutcomeActions.create(
        outcomeData as OutcomeCreationAttributes
      );

      return res.status(201).json({
        ok: true,
        message: "Egreso creada correctamente.",
        data: newOutcome,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al crear la egreso.");
    }
  },

  updateOutcome: async (req: Request, res: Response) => {
    try {
      const outcomeId = parseInt(req.params.id || "0", 10);

      if (!outcomeId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de egreso inválido" });
      }

      const validationResult = OutcomeUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de egreso inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const updateData: OutcomeUpdateRequest = validationResult.data;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedOutcome = await OutcomeActions.update(
        outcomeId,
        updateData as Partial<OutcomeCreationAttributes>
      );

      if (!updatedOutcome) {
        return res.status(404).json({
          ok: false,
          message: "Egreso no encontrada para actualizar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Egreso actualizada correctamente.",
        data: updatedOutcome,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al actualizar la egreso."
      );
    }
  },

  deleteOutcome: async (req: Request, res: Response) => {
    try {
      const outcomeId = parseInt(req.params.id || "0", 10);

      if (!outcomeId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de egreso inválido" });
      }

      const deleted = await OutcomeActions.delete({ id: outcomeId });

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          message: "No se encontró la egreso para eliminar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Egreso eliminada correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al eliminar la egreso.");
    }
  },
};
