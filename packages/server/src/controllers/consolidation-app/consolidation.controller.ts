import { Request, Response } from "express";
import ControllerErrorHandler from "../../utils/ControllerErrorHandler.js";
import type { ConsolidationAttributes } from "@models/consolidation-app/consolidation.model.js";
import {
  ConsolidationCreationSchema,
  ConsolidationUpdateSchema,
} from "@economic-control/shared";
import { consolidationService } from "@services/consolidation/consolidation.service.js";

export const consolidationController = {
  // Obtiene todas las consolidaciones
  allConsolidations: async (_req: Request, res: Response) => {
    try {
      const consolidations: ConsolidationAttributes[] =
        await consolidationService.getAll();

      return res.status(200).json({
        ok: true,
        message:
          consolidations.length === 0
            ? "No hay consolidaciones registradas."
            : "Consolidaciones obtenidas correctamente.",
        data: consolidations,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener las consolidaciones.",
      );
    }
  },

  // Obtiene una consolidación por ID
  oneConsolidation: async (req: Request, res: Response) => {
    try {
      const consolidationId = parseInt(req.params.id as string, 10);

      if (isNaN(consolidationId) || consolidationId <= 0) {
        return res.status(400).json({
          ok: false,
          message: "ID de consolidación inválido.",
        });
      }

      const consolidationObtained =
        await consolidationService.getById(consolidationId);

      if (!consolidationObtained) {
        return res.status(404).json({
          ok: false,
          message:
            "No se encontró la consolidación con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Consolidación obtenida correctamente.",
        data: consolidationObtained,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener la consolidación.",
      );
    }
  },

  // Crea una nueva consolidación
  createConsolidation: async (req: Request, res: Response) => {
    try {
      const validationResult = ConsolidationCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nueva consolidación inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const newConsolidation = await consolidationService.create(
        validationResult.data,
      );

      return res.status(201).json({
        ok: true,
        message: "Consolidación creada correctamente.",
        data: newConsolidation,
      });
    } catch (error: any) {
      if (error.message === "Usuario, miembro o red no encontrado") {
        return res.status(400).json({ ok: false, message: error.message });
      }
      return ControllerErrorHandler(
        res,
        error,
        "Error al crear la consolidación.",
      );
    }
  },

  createBulkConsolidations: async (_req: Request, res: Response) => {
    try {
      const newConsolidations =
        await consolidationService.createMultipleConsolidations();

      return res.status(201).json({
        ok: true,
        message: `Se han creado ${newConsolidations.length} consolidaciones correctamente.`,
        data: newConsolidations,
      });
    } catch (error: any) {
      if (error.message === "No hay miembros registrados") {
        return res.status(400).json({ ok: false, message: error.message });
      }
      return ControllerErrorHandler(
        res,
        error,
        "Error al crear la consolidación.",
      );
    }
  },

  // Actualiza una consolidación
  updateConsolidation: async (req: Request, res: Response) => {
    try {
      const consolidationId = parseInt(req.params.id as string, 10);

      if (isNaN(consolidationId) || consolidationId <= 0) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de consolidación inválido." });
      }

      const validationResult = ConsolidationUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de consolidación inválidos.",
          errors: validationResult.error.issues,
        });
      }

      if (Object.keys(validationResult.data).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedConsolidation = await consolidationService.update(
        consolidationId,
        validationResult.data,
      );

      return res.status(200).json({
        ok: true,
        message: "Consolidación actualizada correctamente.",
        data: updatedConsolidation,
      });
    } catch (error: any) {
      if (error.message === "Consolidación no encontrada") {
        return res.status(404).json({ ok: false, message: error.message });
      }
      return ControllerErrorHandler(
        res,
        error,
        "Error al actualizar la consolidación.",
      );
    }
  },

  // Elimina una consolidación
  deleteConsolidation: async (req: Request, res: Response) => {
    try {
      const consolidationId = parseInt(req.params.id as string, 10);

      if (isNaN(consolidationId) || consolidationId <= 0) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de consolidación inválido." });
      }

      await consolidationService.remove(consolidationId);

      return res.status(200).json({
        ok: true,
        message: "Consolidación eliminada correctamente.",
      });
    } catch (error: any) {
      if (error.message === "Consolidación no encontrada") {
        return res.status(404).json({ ok: false, message: error.message });
      }
      return ControllerErrorHandler(
        res,
        error,
        "Error al eliminar la consolidación.",
      );
    }
  },
};
