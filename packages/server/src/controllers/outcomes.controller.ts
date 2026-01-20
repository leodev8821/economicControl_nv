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

      return res.status(200).json({
        ok: true,
        message:
          outcomes.length === 0
            ? "No hay egresos registrados."
            : "Egresos obtenidos correctamente.",
        data: outcomes, // ← array vacío si no hay registros
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener las egresos.",
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
        "Error al obtener los egresos por caja.",
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

      const newOutcome = await OutcomeActions.create({
        ...outcomeData,
        date: new Date(outcomeData.date),
      });

      return res.status(201).json({
        ok: true,
        message: "Egreso creada correctamente.",
        data: newOutcome,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al crear la egreso.");
    }
  },

  // Crea múltiples egresos
  createBulkOutcomes: async (req: Request, res: Response) => {
    try {
      const data = req.body;

      if (!Array.isArray(data)) {
        return res.status(400).json({
          ok: false,
          message: "Se esperaba un arreglo de egresos.",
        });
      }

      // Validar cada elemento del arreglo
      const validatedData: OutcomeCreationAttributes[] = [];
      for (const item of data) {
        const result = OutcomeCreationSchema.safeParse(item);
        if (!result.success) {
          return res.status(400).json({
            ok: false,
            message: "Uno o más egresos tienen datos inválidos.",
            errors: result.error.issues,
          });
        }
        const outcomeItem = result.data;
        const newOutcomeData: OutcomeCreationAttributes = {
          cash_id: outcomeItem.cash_id,
          week_id: outcomeItem.week_id,
          amount: outcomeItem.amount,
          description: outcomeItem.description,
          category: outcomeItem.category,
          date: new Date(outcomeItem.date),
        };

        validatedData.push(newOutcomeData);
      }

      const newOutcomes =
        await OutcomeActions.createMultipleOutcomes(validatedData);

      return res.status(201).json({
        ok: true,
        message: `${newOutcomes.length} egresos creados correctamente.`,
        data: newOutcomes,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al crear egresos masivos.",
      );
    }
  },

  // Actualiza una egreso existente
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

      const updatePayload: Partial<OutcomeCreationAttributes> = {};

      if (updateData.cash_id !== undefined)
        updatePayload.cash_id = updateData.cash_id;
      if (updateData.week_id !== undefined)
        updatePayload.week_id = updateData.week_id;
      if (updateData.amount !== undefined)
        updatePayload.amount = updateData.amount;
      if (updateData.description !== undefined)
        updatePayload.description = updateData.description;
      if (updateData.category !== undefined)
        updatePayload.category = updateData.category;
      if (updateData.date !== undefined) {
        updatePayload.date = new Date(updateData.date);
      }

      const updatedOutcome = await OutcomeActions.update(
        outcomeId,
        updatePayload,
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
        "Error al actualizar la egreso.",
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
